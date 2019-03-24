import React from 'react';
import { NavLink } from 'react-router-dom';
import { Header, Menu, Sidebar } from 'semantic-ui-react';

// React router link with active highlight.
const NavItem = props => <NavLink {...props} activeClassName='active' />;

const PageMenu = () => (
  <Sidebar id='page-menu' as={Menu} vertical inverted visible>
    <Menu.Item as='div'>
      <Header inverted as='h3'>Manual Image Rec</Header>
    </Menu.Item>
    <Menu.Item as={NavItem} to='/app/explorer' name='Explorer' />
    <Menu.Item as={NavItem} to='/app/classifier' name='Classifier' />
    <Menu.Item as={NavItem} to='/app/targets' name='Targets' />
    <Menu.Item as={NavItem} to='/app/map' name='Map' />
    <Menu.Item as={NavItem} to='/app/live-view' name='Live View' />
    <Menu.Item as={NavItem} to='/app/pipeline' name='Pipeline' />
  </Sidebar>
);

export default PageMenu;
