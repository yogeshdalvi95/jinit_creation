import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { convertNumber, isEmptyString, validateNumber } from "../../Utils";
import { Card, CircularProgress } from "@mui/material";
import { GridContainer, GridItem } from "../Grid";
import { BehaviorSubject, of, merge } from "rxjs";
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
} from "rxjs/operators";
import { backend_raw_materials } from "../../constants";
import Auth from "../Auth";
import { backend_cities } from "../../constants/UrlConstants";
import { List } from "@material-ui/core";

const RawMaterialList = forwardRef((props, ref) => {
  const [subject, setSubject] = useState(null);
  /** RXJS */
  const [state, setState] = useState({
    data: {
      data: [],
    },
    noResults: false,
    page: 1,
    text: "",
    hasMore: false,
    loading: false,
    errorMessage: "",
  });

  useImperativeHandle(ref, () => ({
    handleChangeFunction(text) {
      if (isEmptyString(text)) {
        setState({
          data: {
            data: [],
          },
          page: 1,
          text: "",
          loading: false,
          noResults: true,
        });
      } else {
        if (subject && !props.isView) {
          return subject.next(text);
        }
      }
    },
  }));

  useEffect(() => {
    if (subject === null) {
      const sub = new BehaviorSubject("");
      setSubject(sub);
    } else {
      const observable = subject
        .pipe(
          map((s) => s.trim()),
          distinctUntilChanged(),
          filter((s) => s.length >= 2),
          debounceTime(200),
          switchMap((term) => {
            setState((state) => ({
              ...state,
              data: {
                data: [],
              },
              page: 1,
              loading: true,
              text: term,
              noResults: false,
            }));
            let params = {
              page: state.page,
              pageSize: 10,
              name_contains: term,
            };
            return merge(
              of({ loading: true, errorMessage: "", noResults: false }),
              fetch(backend_raw_materials + "?" + new URLSearchParams(params), {
                method: "GET",
                headers: {
                  "content-type": "application/json",
                  Authorization: "Bearer " + Auth.getToken(),
                },
              })
                .then((response) => {
                  if (response.ok) {
                    return response.json().then((data) => ({
                      data,
                      loading: false,
                      noResults: data.data.length === 0,
                      hasMore: data.data.length !== 0,
                    }));
                  } else {
                    return response.json().then((data) => ({
                      data: [],
                      loading: false,
                      errorMessage: data.title,
                      noResults: false,
                      hasMore: false,
                    }));
                  }
                })
                .catch((error) => {
                  throw error;
                })
            );
          }),
          catchError((e) => ({
            loading: false,
            errorMessage: "An application error occured",
          }))
        )
        .subscribe((newState) => {
          setState((s) => {
            return Object.assign({}, s, newState);
          });
        });

      return () => {
        observable.unsubscribe();
        subject.unsubscribe();
      };
    }
  }, [subject]);

  const loadMoreData = () => {
    setState((state) => ({
      ...state,
      loading: true,
    }));
    let params = {
      page: state.page + 1,
      pageSize: 10,
      name_contains: state.text,
    };
    fetch(backend_raw_materials + "?" + new URLSearchParams(params), {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + Auth.getToken(),
      },
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            const dataToAppend = data.data;
            setState((state) => ({
              ...state,
              data: {
                data: [...state.data.data, ...dataToAppend],
              },
              loading: false,
              noResults: dataToAppend.length === 0,
              hasMore: dataToAppend.length !== 0,
              page: state.page + 1,
            }));
          });
        } else {
          setState((state) => ({
            ...state,
            loading: false,
          }));
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  console.log("State => ", state);

  return (
    <React.Fragment>
      {state.loading ||
      (state.data && state.data.data && state.data.data.length) ? (
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            {/* <Card
              sx={{
                position: "absolute",
                zIndex: 1000,
                maxWidth: "fit-content",
                overflow: "scroll",
                maxHeight: 100,
              }}
            >
              <TableContainer component={Paper}>
                <Table
                  sx={{ minWidth: 650 }}
                  size="small"
                  aria-label="a dense table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell align="right">Costing</TableCell>
                      <TableCell align="right">Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody >
                    {state.data.data.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            backgroundColor: "#ddd",
                            cursor: "pointer",
                          },
                        }}
                      >
                        <TableCell>
                          <button
                            onClick={() => {
                              setState({
                                data: {
                                  data: [],
                                },
                                loading: false,
                                errorMessage: "",
                                noResults: false,
                              });
                              props.handleSelectRawMaterial(row);
                            }}
                          >
                            Select
                          </button>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {row?.name ? row.name : "----"}
                        </TableCell>
                        <TableCell>
                          {row?.category?.name ? row.category.name : "-----"}
                        </TableCell>
                        <TableCell>
                          {row?.department?.name
                            ? row.department.name
                            : "-----"}
                        </TableCell>
                        <TableCell>
                          {row?.color?.name ? row.color.name : "-----"}
                        </TableCell>
                        <TableCell>{row?.size ? row.size : "----"}</TableCell>
                        <TableCell align="right">
                          {convertNumber(
                            validateNumber(row.costing),
                            true,
                            true,
                            row?.unit?.name ? " /" + row.unit.name : ""
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {row?.balance ? row.balance : 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card> */}
            <Card
              sx={{
                position: "absolute",
                zIndex: 1000,
                maxWidth: "fit-content",
              }}
            >
              <List
                onScroll={(event) => {
                  if (
                    event.target.scrollHeight - event.target.scrollTop < 350 &&
                    state.hasMore
                  ) {
                    console.log(
                      "height measurment => ",
                      event.target.scrollHeight,
                      event.target.scrollTop
                    );
                    loadMoreData();
                  }
                }}
                style={{
                  maxHeight: 300,
                  overflowY: "scroll",
                }}
              >
                {state.data && state.data.data && state.data.data.length
                  ? state.data.data.map((row) => {
                      return (
                        <TableRow
                          key={row.id}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            "&:hover": {
                              backgroundColor: "#ddd",
                              cursor: "pointer",
                            },
                          }}
                        >
                          <TableCell>
                            <button
                              onClick={() => {
                                setState({
                                  data: {
                                    data: [],
                                  },
                                  loading: false,
                                  errorMessage: "",
                                  noResults: false,
                                });
                                props.handleSelectRawMaterial(row);
                              }}
                            >
                              Select
                            </button>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {row?.name ? row.name : "----"}
                          </TableCell>
                          <TableCell>
                            {row?.category?.name ? row.category.name : "-----"}
                          </TableCell>
                          <TableCell>
                            {row?.department?.name
                              ? row.department.name
                              : "-----"}
                          </TableCell>
                          <TableCell>
                            {row?.color?.name ? row.color.name : "-----"}
                          </TableCell>
                          <TableCell>{row?.size ? row.size : "----"}</TableCell>
                          <TableCell align="right">
                            {convertNumber(
                              validateNumber(row.costing),
                              true,
                              true,
                              row?.unit?.name ? " /" + row.unit.name : ""
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {row?.balance ? row.balance : 0}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
                {state.loading && (
                  <TableRow
                    key={34567899876543256789}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": {
                        backgroundColor: "#ddd",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <TableCell colSpan={3}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}
              </List>
            </Card>
          </GridItem>
        </GridContainer>
      ) : null}
    </React.Fragment>
  );
});

export default RawMaterialList;
