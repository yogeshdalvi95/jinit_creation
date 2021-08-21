import React from "react";
import { GridContainer, GridItem } from "../Grid";

export default function RawMaterialDetail(props) {
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Raw Material Details</b>
          </GridItem>
        </GridContainer>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Id : </b>
            {`# ${props.raw_material.id}`}
          </GridItem>
        </GridContainer>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Name : </b> {props.raw_material.name}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Department : </b>
            {props.raw_material.department}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Category : </b>
            {props.raw_material.category}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Color :</b> {props.raw_material.color}
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
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  );
}
