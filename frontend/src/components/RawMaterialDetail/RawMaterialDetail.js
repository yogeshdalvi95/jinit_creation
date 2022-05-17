import React from "react";
import { GridContainer, GridItem } from "../Grid";

export default function RawMaterialDetail(props) {
  let department = " ----";
  let color = " ----";
  let category = " ----";
  if (
    props.raw_material.department &&
    typeof props.raw_material.department === "object" &&
    props.raw_material.department.name
  ) {
    department = props.raw_material.department.name;
  }
  if (
    props.raw_material.color &&
    typeof props.raw_material.color === "object" &&
    props.raw_material.color.name
  ) {
    color = props.raw_material.color.name;
  }
  if (
    props.raw_material.category &&
    typeof props.raw_material.category === "object" &&
    props.raw_material.category.name
  ) {
    category = props.raw_material.category.name;
  }
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Name : </b> {props.raw_material.name}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Department : </b>
            {department}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Category : </b>
            {category}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Color :</b>
            {color}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Size : </b>
            {props.raw_material.size}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Balance : </b>
            {props.raw_material.balance}
            {props.includeUnits ? " " + props.raw_material.unit : null}
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  );
}
