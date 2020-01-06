import React, { Component } from 'react';
import './App.css';
import { Row, Col, Alert, Button, ButtonGroup } from 'react-bootstrap';

import GenProof from './screens/GenProof';
import Verify from './screens/Verify';

class Main extends Component {
  state = {
    view: "genProof"
  }

  render(){
    return(
      <div className="App">
        <Row>
          <Col xs={12}>
            <h2>Fishing Secrets Demo</h2>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-left" style={{margin: "10px"}}> 
            <h3 style={{display: "inline"}}>Explore: </h3>
            <ButtonGroup>
              <Button variant="secondary" onClick={() => this.setState({ view: "genProof"})}
              disabled={this.state.view === "genProof"}>Generate Proof</Button>
              <Button variant="secondary" onClick={() => this.setState({ view: "verify"})}
              disabled={this.state.view === "verify"}>Verify Proofs</Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Alert variant="info">
                Make sure the database `legal/fishing` is running on `http://localhost:8080`, and that this database contains both the schema and the necessary items in snarkConfig (see the `seed` folder).
              </Alert>
          </Col>
        </Row>
          {
            this.state.view === "genProof" && <GenProof />
          }
          {
            this.state.view === "verify" && <Verify/>
          }
      </div>
    )
  }

}

export default Main;
