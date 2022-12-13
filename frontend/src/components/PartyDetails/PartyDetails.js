import { Link } from "@mui/material";
import React from "react";
import { frontendServerUrl } from "../../constants";
import { VIEWPARTY } from "../../paths";
import { GridContainer, GridItem } from "../Grid";

export default function PartyDetails(props) {
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Party Details</b>
          </GridItem>
        </GridContainer>
        {props && props.viewParty && (
          <GridContainer>
            <GridItem xs={12} sm={12} md={8}>
              <Link
                href={`${frontendServerUrl}${VIEWPARTY}/${props.party.id}`}
                underline="always"
                target="_blank"
              >
                Check party data here
              </Link>
            </GridItem>
          </GridContainer>
        )}
        <GridContainer style={{ dispay: "flex" }}>
          <GridItem xs={12} sm={12} md={8}>
            <b>Name : </b> {props.party?.party_name}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>GST No : </b>
            {props.party?.gst_no}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Address : </b>
            {props.party?.party_address}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Email : </b>
            {props.party?.party_email}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Phone : </b>
            {props.party?.phone}
          </GridItem>
        </GridContainer>
        <GridContainer>
          <GridItem xs={12} sm={12} md={8}>
            <b>Add. Details : </b>
            {props.party?.extra_details}
          </GridItem>
        </GridContainer>
      </GridItem>
    </GridContainer>
  );
}
