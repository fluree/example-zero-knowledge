import React, { Component } from 'react';
import './App.css';
import { Row, Col, Form, Alert, Button } from 'react-bootstrap';
import interact from 'interactjs';
import  zkSnark from 'snarkjs';

import circuit from './circuits/InRange.json';
import proving_key from './circuits/proving_key.json';

class AuthorizedZone extends Component {
  componentDidMount(){
    interact('.resize-drag')
    .draggable({
      onmove:  (event) => {
        const target = event.target;

        const dataX = target.getAttribute('data-x');
        const dataY = target.getAttribute('data-y');
        const initialX = parseInt(dataX) || 0;
        const initialY = parseInt(dataY) || 0;

        const deltaX = event.dx;
        const deltaY = event.dy;

        const newX = initialX + deltaX;
        const newY = initialY + deltaY;

        target
          .style
          .transform = `translate(${newX}px, ${newY}px)`;

        target.setAttribute('data-x', newX);
        target.setAttribute('data-y', newY);

        let topLeftX = parseInt(( newX + 80 ) / 5);
        if(topLeftX > 100) {
          topLeftX = 100
        } else if (topLeftX < 0 ){
          topLeftX = 0
        };

        let topLeftY = parseInt( (newY + 59) / 2.4);
        if(topLeftY > 100) {
          topLeftY = 100
        } else if (topLeftY < 0 ){
          topLeftY = 0
        };

        this.props.setCoords(topLeftX, topLeftY)
        },
        restrict: {
          restriction: 'parent',
        },
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent'
          })
        ]
    })
    .resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: 'parent'
          }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 50, height: 50 }
          })
        ],
        inertia: true
    })
    .on('resizemove', (event) => {
        var target = event.target
        var x = (parseInt(target.getAttribute('data-x')) || 0)
        var y = (parseInt(target.getAttribute('data-y')) || 0)

        // update the element's style
        target.style.width = event.rect.width + 'px'
        target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left
        y += event.deltaRect.top

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)

        let width = parseInt(event.rect.width/5);
        let height = parseInt(event.rect.height/2.4);

        let topLeftX = parseInt((( x + 80 ) / 5));
        if(topLeftX > 100) {
          topLeftX = 100
        } else if (topLeftX < 0 ){
          topLeftX = 0
        };

        let topLeftY = parseInt( (y + 59) / 2.4);
        if(topLeftY > 100) {
          topLeftY = 100
        } else if (topLeftY < 0 ){
          topLeftY = 0
        };

        this.props.setCoords(topLeftX, topLeftY)
        this.props.setDimensions(width, height)
    })
  }

  render() {
    return(
          <div className="mt20">
            <div style={{margin: "20px", textAlign: "left", fontSize: "20px" }}>
              1. Create an authorized fishing zone by dragging and resizing the dark blue box below. 
            </div>

            <div className="resize-container">
            <div className="x-axis">
                <span style={{float: "left" }}>0</span>
                <span style={{textAlign: "left" }}>_</span>
                <span style={{float: "right", paddingRight: "10px"}}>100</span>
              </div>
              <div style={{ float: "left", padding: "0px 0px 0px 10px"}}>
                <div style={{textAlign: "left", paddingTop: "185px"}}>100</div>
              </div>
              <div className="resize-drag" id="legalZone">Legal Zone</div>
              <br/>    
            </div>
          </div>
    )
}}

function FishingLocation(props) {
    return(
      <Row>
      <Col xs={12}>
        <div style={{margin: "20px", textAlign: "left", fontSize: "20px" }}>
            2. Put in your (secret) fishing location.
          </div>
        <Alert variant="warning">
          <div>We do not share your fishing location with anyone!</div>
          <div>We use your fishing location to generate a proof that you fished in a legal zone, but the coordinates are not recorded anywhere.</div>     
        </Alert>
        <Form inline style={{padding: "10px 0px 0px 50px"}}>
            <Form.Label style={{padding: "10px"}}>X: </Form.Label>
            <Form.Control type="number" placeholder="0" min="0" max="100" value={props.xcoord} onChange={props.setX}/>
            <Form.Label style={{padding: "10px"}}>Y:</Form.Label>
            <Form.Control type="number" placeholder="0" min="0" max="100" value={props.ycoord} onChange={props.setY}/>
        </Form>
      </Col>
    </Row>
    )
  }

class GenerateProof extends Component {
  state = {}

  generateProof = () => {
    let maxLong = this.props.topLeftX + this.props.width > 100 ? 100 : this.props.topLeftX + this.props.width;
    let maxLat = this.props.topLeftY + this.props.height > 100 ? 100 : this.props.topLeftY + this.props.height;

    const cir = new zkSnark.Circuit(circuit);
    
    const input = { 
      "latitudeRange": [ this.props.topLeftX, maxLong],
      "longitudeRange":  [ this.props.topLeftY, maxLat],
      "fishingLocation": [ this.props.xcoord, this.props.ycoord]
    }

    const witness = cir.calculateWitness(input); 
    const vk_proof = zkSnark.unstringifyBigInts(proving_key);

    let {proof, publicSignals} = zkSnark.original.genProof(vk_proof, witness);
    proof =  zkSnark.stringifyBigInts(proof);
    publicSignals =  zkSnark.stringifyBigInts(publicSignals);

    this.setState({ proof: proof, publicSignals: publicSignals})
  }
  
  render(){
    return (
      <Row>
        <Col xs={12}>
          <div style={{margin: "20px", textAlign: "left", fontSize: "20px" }}>
            3. Generate the proof -  <Button disabled={!this.props.inRange} onClick={this.generateProof}>Generate Proof</Button>
          </div>
          <div style={{border: "1px solid black"}}>
            <div style={{height: "50px", marginTop: "20px"}}>
              Proof: {JSON.stringify(this.state.proof, null, 2)}
            </div>
            <div>
              Public Signals: {JSON.stringify(this.state.publicSignals, null, 2) }
            </div>
          </div>
        </Col>
      </Row>
    )
  }
}


class App extends Component {
  state = {
    xcoord: "",
    ycoord: "",
    width: 26,
    height: 20,
    topLeftX: 16,
    topLeftY: 0
  }
  coordinateToInt(coord){   
    if(isNaN(coord)){
      coord = ""
    } else if (coord > 100) {
      coord = 100
    } else if (coord < 0) {
      coord = 0
    } 
    return coord
  }
  
  setX = (e) => {
    const proposedx = parseInt(e.target.value);
    const x = this.coordinateToInt(proposedx)
    this.setState({ xcoord: x})
  }

  setY = (e) => {
    const proposedy = parseInt(e.target.value);
    const y = this.coordinateToInt(proposedy)
    this.setState({ ycoord: y})
  }

  setCoords = (x, y) => {
    this.setState({ topLeftX: x, topLeftY: y})
  }

  setDimensions = (width, height) => {
    this.setState({ width: width, height: height })
  }

  render() {
    let inRange = this.state.xcoord >= this.state.topLeftX && this.state.xcoord <= this.state.topLeftX + this.state.width 
    && this.state.ycoord >= this.state.topLeftY && this.state.ycoord <= this.state.topLeftY + this.state.height;

    return (
    <div className="App">
      <Row>
        <Col xs={12}>
          <h2>Fishing Secrets Demo</h2>
        </Col>
      </Row>
      <Row> 
        <Col lg={6}>
          <AuthorizedZone setCoords={this.setCoords} setDimensions={this.setDimensions}/>
        </Col>
        <Col lg={6}>
          <div style={{margin: "50px", border: "1px solid lightblue"}}>
            <div>Your Legal Fishing Zone: </div>
            <div>Height: {this.state.height}</div>
            <div>Width: {this.state.width}</div>
            <div>Top Left Corner: ({this.state.topLeftX}, {this.state.topLeftY})</div>
            <div>Bottom Right Corner: ({this.state.topLeftX + this.state.width > 100 ? 100 : this.state.topLeftX + this.state.width }, {this.state.topLeftY + this.state.height > 100 ? 100 : this.state.topLeftY + this.state.height})</div>
          </div>
        </Col>
      </Row>
      <FishingLocation setX={this.setX} setY={this.setY} xcoord={this.state.xcoord} ycoord={this.state.ycoord}/>
      <Row>
        <Col xs={12}>
          <div style={{ width: "200px", margin: "10px 0px 0px 55px" }}>
           {
            inRange
             ?
              <Alert variant="success">
                Congrats, your fishing location is within the legal zone.
              </Alert>
            :
              <Alert variant="danger">
                Sorry, your fishing location is NOT within the legal zone.
              </Alert>
           }
          </div>
        </Col>
      </Row>
      <GenerateProof xcoord={this.state.xcoord} ycoord={this.state.ycoord} topLeftX={this.state.topLeftX}
      topLeftY={this.state.topLeftY} height={this.state.height} width={this.state.width} inRange={inRange}/>
    </div>
  )}
}

export default App;
