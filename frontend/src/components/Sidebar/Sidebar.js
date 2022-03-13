/*eslint-disable*/
import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Icon from "@material-ui/core/Icon";
// core components
import AdminNavbarLinks from "../Navbars/AdminNavbarLinks.js";
import IconExpandLess from "@material-ui/icons/ExpandLess";
import IconExpandMore from "@material-ui/icons/ExpandMore";

import styles from "../../assets/jss/material-dashboard-react/components/sidebarStyle.js";
import { isEmptyString } from "../../Utils/index.js";
import { Collapse, Divider } from "@material-ui/core";

const useStyles = makeStyles(styles);

export default function Sidebar(props) {
  const { color, logo, image, logoText, routes } = props;
  const classes = useStyles();
  let location = useLocation();
  const [subMenu, setSubMenu] = React.useState({
    open: props.openSubMenu,
  });

  function handleClick(name) {
    setSubMenu((subMenu) => ({
      ...subMenu,
      [name]: !subMenu[name],
    }));
  }

  // verifies if routeName is the one active (in browser input)
  function activeRoute(pathList) {
    if (location.pathname.match(/[\/]\d+$/g)) {
      let result = location.pathname.replace(/[\/]\d+$/g, "/:id");
      return pathList.indexOf(result) > -1;
    } else {
      return pathList.indexOf(location.pathname) > -1;
    }
  }

  /** Set all the parent menu keys in subMenu variable when the parent menu has children */
  React.useEffect(() => {
    let temp_sub_menu = {};
    for (let i in routes) {
      let value = false;
      if (activeRoute(routes[i].pathList) && props.openSubMenu) {
        value = true;
      }
      if (routes[i].children && routes[i].children.length) {
        temp_sub_menu = {
          ...temp_sub_menu,
          [routes[i].name]: value,
        };
      }
    }
    setSubMenu(temp_sub_menu);
  }, [routes]);

  const getLinks = (arr) => {
    return (
      <List className={classes.list}>
        {arr.map((prop, key) => {
          const isExpandable = prop.children && prop.children.length > 0;
          var activePro = " ";
          var listItemClasses;
          listItemClasses = classNames({
            [" " + classes[color]]: activeRoute(prop.pathList),
          });

          var listItemClassesWhenChildren = classNames({
            [" " + classes["transparent"]]: activeRoute(prop.pathList),
          });

          const whiteFontClasses = classNames({
            [" " + classes.whiteFont]: activeRoute(prop.pathList),
          });

          const MenuItemChildren = isExpandable ? (
            <Collapse in={subMenu[prop.name]} timeout="auto" unmountOnExit>
              <Divider
                style={{
                  color: "#FFFFFF",
                }}
              />
              <div
                style={{
                  marginLeft: "1rem",
                }}
              >
                {getLinks(prop.children)}
              </div>
            </Collapse>
          ) : null;

          if (isExpandable) {
            return (
              <>
                <ListItem
                  className={classes.itemLink + listItemClassesWhenChildren}
                  style={{
                    display: "flex",
                  }}
                  button
                  onClick={() => {
                    handleClick(prop.name);
                  }}
                >
                  <ListItemText
                    primary={prop.name}
                    className={classNames(classes.itemText, whiteFontClasses)}
                    disableTypography={true}
                  />
                  {isExpandable && !subMenu[prop.name] && (
                    <IconExpandMore
                      style={{
                        color: "#FFFFFF",
                      }}
                      onClick={() => {
                        handleClick(prop.name);
                      }}
                    />
                  )}
                  {isExpandable && subMenu[prop.name] && (
                    <IconExpandLess
                      style={{
                        color: "#FFFFFF",
                      }}
                      onClick={() => {
                        handleClick(prop.name);
                      }}
                    />
                  )}
                </ListItem>
                {MenuItemChildren}
              </>
            );
          } else {
            return (
              <NavLink
                to={prop.layout + prop.path}
                className={activePro + classes.item}
                activeClassName="active"
                key={key}
              >
                <ListItem button className={classes.itemLink + listItemClasses}>
                  <ListItemText
                    primary={prop.name}
                    className={classNames(classes.itemText, whiteFontClasses)}
                    disableTypography={true}
                  />
                </ListItem>
              </NavLink>
            );
          }
        })}
      </List>
    );
  };

  var brand = (
    <div className={classes.logo}>
      <a
        href="https://www.creative-tim.com?ref=mdr-sidebar"
        className={classNames(classes.logoLink)}
        target="_blank"
      >
        <div className={classes.logoImage}>
          <img src={logo} alt="logo" className={classes.img} />
        </div>
        {logoText}
      </a>
    </div>
  );
  return (
    <div>
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={props.rtlActive ? "left" : "right"}
          open={props.open}
          classes={{
            paper: classNames(classes.drawerPaper, {
              [classes.drawerPaperRTL]: props.rtlActive,
            }),
          }}
          onClose={props.handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>
            <AdminNavbarLinks />
            {getLinks(routes)}
          </div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          anchor={props.rtlActive ? "right" : "left"}
          variant="permanent"
          open
          classes={{
            paper: classNames(classes.drawerPaper, {
              [classes.drawerPaperRTL]: props.rtlActive,
            }),
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>{getLinks(routes)}</div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
        </Drawer>
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
