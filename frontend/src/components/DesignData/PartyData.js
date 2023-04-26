import { Chip, Grid, Link } from "@mui/material";
import React from "react";
import { frontendServerUrl } from "../../constants";
import { VIEWPARTY } from "../../paths";

export default function PartyData(props) {
  const handleClick = (id) => {
    return window.open(
      `${frontendServerUrl}${VIEWPARTY}/${id}`,
      "_blank",
      "noreferrer"
    );
  };
  if (props.data && props.data.length) {
    console.log("el => ", props.data);
    return (
      <>
        {props.data.map((el, index) => (
          <Grid container>
            <Grid item xs={12} marginTop={1}>
              <Chip
                label={el.party.party_name}
                variant="outlined"
                onClick={() => handleClick(el.id)}
              />
            </Grid>
          </Grid>
        ))}
      </>
    );
  } else {
    return <></>;
  }
}
