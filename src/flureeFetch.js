import fetch from 'isomorphic-fetch';

function gateway(ip) {
  let hosted = process.env.REACT_APP_ENVIRONMENT === "hosted";
  let production = process.env.NODE_ENV === "production";

  if (hosted && production) {
    return "https://db.flur.ee";
  } 
  else if (hosted) {
    return "http://localhost:8080"
  } else if (!hosted){
    return ip;
  }
}

function parseJSON(response) {
  return response.json().then(function (json) {
    const newResponse = Object.assign(response, { json });

	if (response.status < 300) {
		return newResponse;
	  } else {
		throw newResponse;
	  }
  });
}

function fullEndpoint(endpoint, network, db, body, ip) {
	const hosted = process.env.REACT_APP_ENVIRONMENT === "hosted";
	const endpointInfix = hosted ? "api" : "fdb";

	const locatedEndpoint = [
		"query",
		"multi-query",
		"block",
		"history",
		"transact",
		"graphql",
		"sparql",
		"command",
		"snapshot"
	].includes(endpoint);

	const startURI = gateway(ip);

	if (locatedEndpoint) {
		if (endpoint === "snapshot") {
			return `${startURI}/${endpointInfix}/${body["db/id"]}/${endpoint}`;
		} else {
			return `${startURI}/${endpointInfix}/${
				hosted ? "db/" : ""
			}${network}/${db}/${endpoint}`;
		}
	}

	const prefixedEndpoints = [
		"dbs",
		"action",
		"new-db",
		"accounts",
		"signin",
		"health",
		"sub",
		"new-pw",
		"reset-pw",
		"activate-account",
		"delete-db"
	].includes(endpoint);

	if (prefixedEndpoints) {
		return `${startURI}/${endpointInfix}/${endpoint}`;
	}

	if (endpoint === "logs") {
		return `${startURI}/${endpointInfix}/fdb/${endpoint}/${network}`;
	}

	throw {
		status: 400,
		message: "Invalid endpoint"
	};
}

const flureeFetch = opts => {
	// Opts include: ip, body, auth, network, db, endpoint
	const { ip, body, auth, network, db, endpoint, headers, noRedirect } = opts;

	const fullUri = fullEndpoint(endpoint, network, db, body, ip);

	const finalHeaders = headers
		? headers
		: {
				"Content-Type": "application/json",
				"Request-Timeout": 20000,
				Authorization: `Bearer ${auth}`
		  };

	const fetchOpts = {
		method: "POST",
		headers: finalHeaders,
		body: JSON.stringify(body)
	};

	return fetch(fullUri, fetchOpts)
		.then(parseJSON)
		.catch(error => {
			if (!noRedirect && (error.status === 401 || error.status === 403)) {
				localStorage.removeItem("token");
				// main token expired, need to log back in.
				if (this.props) {
					this.props.logout();
				} else {
					window.location = "/";
				}
			} else {
				if (error.json) {
					return error.json;
				}

				return error;
			}
		});
};

export { flureeFetch };
