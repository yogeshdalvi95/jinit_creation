import React from "react";
// material-ui components
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
// core components

import styles from "../assets/jss/material-dashboard-react/components/customTabsStyle.js";
import { Card, CardBody, CardHeader, GridItem } from "../components/index.js";
import { RAWMATERIALSVIEW, SELLERS, UNITS } from "../paths/Paths.js";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(styles);

export default function RawMaterialTabLayout(props) {
  const history = useHistory();

  const handleChange = (event, value) => {
    tabs.map(r => {
      if (r.value == value) {
        history.push(r.path);
      }
    });
  };
  const tabs = [
    {
      value: 0,
      tabName: "Raw Materials",
      path: RAWMATERIALSVIEW
    },
    {
      value: 1,
      tabName: "Units",
      path: UNITS
    }
  ];
  const classes = useStyles();
  const { component: Component, value } = props;

  return (
    <GridItem xs={12} sm={12} md={12}>
      <Card plain>
        <CardHeader color={"primary"} plain>
          <Tabs
            value={value}
            onChange={handleChange}
            classes={{
              root: classes.tabsRoot,
              indicator: classes.displayNone,
              scrollButtons: classes.displayNone
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((prop, key) => {
              var icon = {};
              if (prop.tabIcon) {
                icon = {
                  icon: <prop.tabIcon />
                };
              }
              return (
                <Tab
                  classes={{
                    root: classes.tabRootButton,
                    selected: classes.tabSelected,
                    wrapper: classes.tabWrapper
                  }}
                  key={key}
                  label={prop.tabName}
                  {...icon}
                />
              );
            })}
          </Tabs>
        </CardHeader>
        <CardBody>
          <Component />
        </CardBody>
      </Card>
    </GridItem>
  );
}
