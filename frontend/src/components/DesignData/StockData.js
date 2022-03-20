import { Grid, Typography } from "@mui/material";
import React from "react";

export default function DesignData(props) {
  return (
    <>
      {props.data.map((el, index) => (
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              <b>{el.color?.name}: </b> {el.stock ? el.stock : 0}
            </Typography>
          </Grid>
        </Grid>
      ))}
    </>
  );
}
