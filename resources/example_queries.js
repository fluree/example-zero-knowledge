// 1. Query to get circuit
// This query first finds the `snarkConfig` with id, `legalFishing`,
// and then follows that relationship to get the config's circuit and proving key. 

const getCircuit = 
{   "selectOne": ["?circuit", "?provingKey"],
    "where": [
            ["?snark", "snarkConfig/id", "legalFishing"],
            ["?snark", "snarkConfig/circuit", "?circuit"],
            ["?snark", "snarkConfig/provingKey", "?provingKey"]]
}

// 2. Get proofs submitted by `Tf44rUrCADcT4uDDAXUttcB2dgFiNsmcEjm`
// Must be submitted to the /history endpoint (in the UI select "History" in the central drop-down)

const history = 
{
    "history": [null, "proof/proof"],
    "auth": ["Tf44rUrCADcT4uDDAXUttcB2dgFiNsmcEjm"],
    "pretty-print": true
  }

// 3. Proofs in One Location
// Select all proofs with the same legal fishing

const same_location = 
{
    "select": { "?proof": ["*"] },
    "where": [
    ["?proof", "proof/publicSignals", "[\"1\",\"16\",\"42\",\"0\",\"41\"]"]
    ]
  }