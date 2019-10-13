import React from 'react'
import { Container, Header, Card, Icon, Image} from 'semantic-ui-react';


export default class Target extends React.Component {
 render(props) {
   return (
     <Card>
       <Image src={this.props.crop_image} wrapped ui={false} />
       <Card.Content>
         <Card.Description>
           Shape: {this.props.shape.toUpperCase()} <br />
           Shape Color: {this.props.shape_color.toUpperCase()} <br />
           Alpha Numeric: {this.props.alpha_numeric.toUpperCase()} <br />
           Alpha Numeric Color: {this.props.alpha_numeric_color.toUpperCase()} <br />
         </Card.Description>
       </Card.Content>
     </Card>
   )
 }
}
