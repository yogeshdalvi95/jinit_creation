import { Grid, Typography } from "@mui/material";
import React from "react";
import { GridItem } from "../Grid";

export default function RatioData(props) {
  console.log(props.data);
  if (props.data && props.data.length) {
    return (
      <>
        <Grid
          xs={12}
          sm={12}
          md={12}
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <b>Available Ratio's : </b>
          <span style={{ display: "flex" }}>
            {props.data.map((el, index) => (
              <>
                <Typography variant="body2" gutterBottom>
                  {`${el?.name} ${index + 1 === props.data.length ? "" : ","}`}
                </Typography>
              </>
            ))}
          </span>
        </Grid>
      </>
    );
  } else {
    return <></>;
  }
}
