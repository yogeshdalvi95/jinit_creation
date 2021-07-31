import React from "react";
import { GridContainer, GridItem } from "../Grid";

export default function SellerDetails(props) {
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Seller Details</b>
          </GridItem>
        </GridContainer>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Name : </b> {props.seller.name}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>GST No : </b>
            {props.seller.gst_no}
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  );
}
