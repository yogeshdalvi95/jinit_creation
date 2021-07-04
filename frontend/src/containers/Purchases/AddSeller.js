import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CustomAutoComplete,
  CustomInput,
  FAB,
  GridContainer,
  GridItem
} from "../../components";
// core components
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import styles from "../../assets/jss/material-dashboard-react/controllers/commonLayout";
import { useHistory } from "react-router-dom";
import { RAWMATERIALSVIEW } from "../../paths";
const useStyles = makeStyles(styles);

const top100Films = [];

export default function AddSeller(props) {
  const classes = useStyles();
  const history = useHistory();
  console.log(props);
  const onBackClick = () => {
    history.push(RAWMATERIALSVIEW);
  };
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <FAB align={"start"} size={"small"} onClick={onBackClick}>
          <KeyboardArrowLeftIcon />
        </FAB>
      </GridItem>
      <GridItem xs={12} sm={12} md={8}>
        <Card>
          <CardHeader color="primary" className={classes.cardHeaderStyles}>
            <h4 className={classes.cardTitleWhite}>{props.header}</h4>
            <p className={classes.cardCategoryWhite}></p>
          </CardHeader>
          <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Name"
                  id="name"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomAutoComplete
                  id="department-name"
                  labelText="Department"
                  autocompleteId={"department"}
                  optionKey={"title"}
                  options={top100Films}
                  formControlProps={{
                    fullWidth: true
                  }}
                />
                {/* <Autocomplete
                  id="combo-box-demo"
                  options={top100Films}
                  getOptionLabel={option => option.title}
                  style={{ width: 300 }}
                  renderInput={params => (
                    <TextField {...params} label="Combo box" margin="normal" />
                  )}
                /> */}
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  labelText="Size"
                  id="size"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                  labelText="Color"
                  id="color"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <CustomAutoComplete
                  id="unit-name"
                  labelText="Unit"
                  autocompleteId={"unit-id"}
                  optionKey={"title"}
                  options={top100Films}
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>

            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Costing"
                  id="costing"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={6}>
                <CustomInput
                  labelText="Balance"
                  id="balance"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>
          </CardBody>
          <CardFooter>
            <Button color="primary">Add</Button>
          </CardFooter>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
