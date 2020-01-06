import React, { Component } from 'react';
import { flureeFetch } from '../flureeFetch';
import { Alert, Button, Table } from 'react-bootstrap';
import  zkSnark from 'snarkjs';

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

class Proof extends Component {
    state = {
        loading: false
    }

    verify  = () => {
        this.setState({ loading: true })

        sleep(10)
        .then(res => {
                let verificationKey = JSON.parse(this.props.proof[3]);
                verificationKey = zkSnark.unstringifyBigInts(verificationKey);

                let proof = JSON.parse(this.props.proof[1])
                proof = zkSnark.unstringifyBigInts(proof);

                let publicSignals = JSON.parse(this.props.proof[2]);

                if (zkSnark.original.isValid(verificationKey, proof, publicSignals)) {
                    this.setState({ verified: true, loading: false })
                } else {
                    this.setState({ notVerified: true, loading: false })
                }
            })
    }


    render(){
        const coords = JSON.parse(this.props.proof[2]);
        return(
            <tr>
                <td>{JSON.stringify(this.props.proof[0])}</td>
                <td>({coords[1]}, {coords[3]})</td>
                <td>({coords[2]}, {coords[4]})</td>
                <td>{this.props.proof[4]}</td>
                <td>
                {
                    this.state.verified 
                    ?
                    <Alert variant="success">Verified!</Alert>
                    :
                    <Button disabled={this.state.loading} onClick={this.verify}>
                        {this.state.loading ? "Verifying" : "Verify" }</Button>
                }
                {
                    this.state.notVerified && <Alert variant="danger">Not Verified!</Alert>
                }
                </td>
            </tr>
        )
    }
}

class Verify extends Component {
    state = {
        
    }

    componentDidMount(){
        flureeFetch({
            "ip": "http://localhost:8080", 
            "network": "legal", 
            "db": "fishing",
            "endpoint": "query",
            "body": {
                "select": ["?proof", "?proofBody", "?publicSignals", "?verificationKey", "?instant"],
                "where": [
                    ["?proof", "proof/proof", "?proofBody"],
                    ["?proof", "proof/publicSignals", "?publicSignals"],
                    ["?proof", "proof/instant", "?instant"],
                    ["?config", "snarkConfig/id", "legalFishing"],
                    ["?config", "snarkConfig/verificationKey", "?verificationKey"]
                    ]
            }
        })
        .then(res => {
            const proofs = res.json;
            this.setState({ proofs: proofs})
        })
        .catch(err => this.setState({ error: JSON.stringify(err.message)}))
    }

    render(){
        return (
            <div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>_id</th>
                            <th>Legal Zone: Top Left Corner</th>
                            <th>Legal Zone: Bottom Right Corner</th>
                            <th>Submitted</th>
                            <th>Verify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.proofs &&
                            this.state.proofs.map(proof => <Proof id={proof[0]} proof={proof}/>)
                        }
                    </tbody>
                </Table>
                {
                    this.state.error &&
                    <Alert variant="danger">
                        {this.state.error}
                    </Alert>
                }
            </div>
        )
    }
}

export default Verify;