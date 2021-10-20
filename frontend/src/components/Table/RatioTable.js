import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@material-ui/core";

const styles = {
  table: {
    "& th": {
      textAlign: "center"
    },
    "& td": {
      textAlign: "center"
    }
  }
};

const useStyles = makeStyles(styles);

export default function RatioTable(props) {
  const classes = useStyles();
  return (
    <TableContainer component={Paper}>
      <Table
        sx={{ minWidth: 650 }}
        size="small"
        aria-label="a dense table"
        className={classes.table}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center">Color</TableCell>
            <TableCell align="center">Quantity</TableCell>
            <TableCell align="center">Quantity Completed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map(row => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="center">{row.color.name}</TableCell>
              <TableCell align="center">{row.quantity}</TableCell>
              <TableCell align="center">{row.quantity_completed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
