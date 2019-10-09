import React from 'react';
import {Container, Header, Grid, Image, Form} from 'semantic-ui-react';
import BackgroundImage from './imagery/background_target.jpg'

const shapeOptions = [
  {
    key: 'square',
    text: 'Square',
    value: 'square'
  }, {
    key: 'circle',
    text: 'Circle',
    value: 'circle'
  }, {
    key: 'triangle',
    text: 'Triangle',
    value: 'triangle'
  }
]

const colorOptions = [
  {
    key: 'red',
    text: 'Red',
    value: 'red'
  }, {
    key: 'blue',
    text: 'Blue',
    value: 'blue'
  }, {
    key: 'green',
    text: 'Green',
    value: 'green'
  }
]

export default class Classifier extends React.Component {
  constructor() {
    super()
    this.state = {
      shape: '',
      color: '',
      alphanumeric: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event, data) {
    this.setState({
      [data.name]: data.value
    })
  }

  handleSubmit() {
    const {shape, color, alphanumeric} = this.state
    console.log(shape, color, alphanumeric)
  }

  render() {
    const {shape, color, alphanumeric} = this.state

    return (<Container id='page'>
      <Header as='h1'>Classifier</Header>
      <Grid>
        <Grid.Column width={11}>
          <Image src={BackgroundImage} fluid="fluid"/>
        </Grid.Column>
        <Grid.Column width={5}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Dropdown placeholder='Select Shape' fluid="fluid" name='shape' selection="selection" value={shape} options={shapeOptions} onChange={this.handleChange}/>
            <br/><br/>
            <Form.Dropdown placeholder='Select Color' name='color' value={color} fluid="fluid" selection="selection" options={colorOptions} onChange={this.handleChange}/>
            <br/><br/>
            <Form.Input name='alphanumeric' value={alphanumeric} placeholder='Enter Alphanumeric' onChange={this.handleChange}/> {/* <h1>{this.state.Shape}</h1> */}
            <br/><br/>
            <Form.Group>
              <Form.Button color='grey'>Clear</Form.Button>
              <Form.Button color='green' content='Submit'/>
            </Form.Group>
          </Form>
        </Grid.Column>
        <Grid.Row>
          Info
          <br/>
          Size: 4200x3600
          <br/>
          Target number:
          <br/>
          Time arrived:
          <br/>
        </Grid.Row>
      </Grid>
    </Container>)
  }
}
