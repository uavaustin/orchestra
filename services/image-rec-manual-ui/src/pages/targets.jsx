import React from 'react';
import Target from "./components/Target/Target.js";
import { Container, Header, Card, Icon, Image} from 'semantic-ui-react';
import image0 from "./imagery/shape-0.jpg";
import image1 from "./imagery/shape-1.jpg";
import image2 from "./imagery/shape-2.jpg";
import image3 from "./imagery/shape-3.png";

const Targets = () => (
  <Container id='page'>
    <Header as='h1'>Targets</Header>
    <Card.Group itemsPerRow={6}>
      <Target crop_image={image0} shape="circle" shape_color="red" alpha_numeric="A" alpha_numeric_color="orange"/>
      <Target crop_image={image1} shape="square" shape_color="blue" alpha_numeric="B" alpha_numeric_color="green"/>
      <Target crop_image={image2} shape="triangle" shape_color="green" alpha_numeric="C" alpha_numeric_color="yellow"/>
      <Target crop_image={image3} shape="hexagon" shape_color="orange" alpha_numeric="D" alpha_numeric_color="purple"/>
    </Card.Group>
  </Container>
);

export default Targets;
