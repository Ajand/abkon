import {
  makeStyles,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
} from "@material-ui/core";
import { AddCircle } from "@material-ui/icons";
import { Row, Col, Container } from "react-grid-system";
import { useEffect, useState } from "react";
import FakeApe from "../web3/abis/FakeApe.json";
import PriceFinder from "../web3/abis/PriceFinder.json";
import ABKoin from "../web3/abis/ABKoin.json";

import { ethers } from "ethers";
import contractsAddress from "../contractsAddress";
import { SpinnerDiamond } from "spinners-react";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  section: { padding: theme.spacing(2) },
  informationRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5em",
    alignItems: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: 300,
  },
}));

const Specialist = ({ connection }) => {
  const classes = useStyles();

  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [suggestPrice, setSuggestPrice] = useState(new Map());

  const [yourBalance, setBalance] = useState(0);
  const [yourAllowance, setAllowance] = useState(0);
  const [specialist, setSpecialist] = useState({
    reputation: 0,
    stakes: 0,
    lockedWeight: 0,
  });
  const [maxDestakeAllowed, setMDA] = useState(0);

  const abKoin = new ethers.Contract(
    contractsAddress.abkoin,
    ABKoin.abi,
    connection.signer
  );

  const priceFinder = new ethers.Contract(
    contractsAddress.priceFinder,
    PriceFinder.abi,
    connection.signer
  );

  const mainDataFetching = async () => {
    if (connection.account) {
      const balance = connection.account
        ? await abKoin.balanceOf(connection.account)
        : 0;

      const allowance = connection.account
        ? await abKoin.allowance(connection.account, priceFinder.address)
        : 0;

      setBalance(String(balance));
      setAllowance(String(allowance));

      const requests = await priceFinder.getRequests();

      setMyRequests(
        requests
          .map((req, i) => ({ ...req, id: i }))
          .filter((req) => req.status === 0)
      );

      setSpecialist(await priceFinder.getSpecialist(connection.account));
      setMDA(await priceFinder.calculateMaxDestaking(connection.account));
    }

    setLoading(false);
  };

  useEffect(() => {
    mainDataFetching();
  }, [connection.account]);

  return (
    <Container className={classes.root}>
      <Row>
        <Col md={4}>
          <Paper square>
            {loading ? (
              <>
                <div className={classes.loadingContainer}>
                  <SpinnerDiamond
                    size={73}
                    thickness={180}
                    speed={152}
                    color="rgba(77, 119, 255, 1)"
                    secondaryColor="rgba(242, 250, 90, 1)"
                  />
                </div>
              </>
            ) : (
              <>
                <div className={classes.section}>
                  <div className={classes.informationRow}>
                    <div className={classes.informationTitle}>Your Balance</div>
                    <div className={classes.informationTitle}>
                      {String(yourBalance)} $ABK
                    </div>
                  </div>
                  <div className={classes.informationRow}>
                    <div className={classes.informationTitle}>
                      Your Approval
                    </div>
                    <div className={classes.informationTitle}>
                      <IconButton
                        size="small"
                        onClick={async () => {
                          const tx = await abKoin.approve(
                            priceFinder.address,
                            yourBalance
                          );
                          const isTransactionMined = async (
                            transactionHash
                          ) => {
                            const txReceipt =
                              await connection.provider.getTransactionReceipt(
                                transactionHash
                              );
                            if (txReceipt && txReceipt.blockNumber) {
                              return txReceipt;
                            }
                          };

                          const a = setInterval(() => {
                            if (isTransactionMined(tx.hash)) {
                              setTimeout(() => {
                                mainDataFetching();
                              }, 3 * 1000);
                              clearInterval(a);
                            }
                          }, 2000);
                        }}
                      >
                        <AddCircle color="primary" />
                      </IconButton>{" "}
                      {String(yourAllowance)} $ABK
                    </div>
                  </div>
                  <div className={classes.informationRow}>
                    <div className={classes.informationTitle}>Stakes</div>
                    <div className={classes.informationTitle}>
                      {String(specialist.stakes)} $ABK
                    </div>
                  </div>
                  <div className={classes.informationRow}>
                    <div className={classes.informationTitle}>
                      Locked Weight
                    </div>
                    <div className={classes.informationTitle}>
                      {String(specialist.lockedWeight)}
                    </div>
                  </div>
                  <div className={classes.informationRow}>
                    <div className={classes.informationTitle}>Reputation</div>
                    <div className={classes.informationTitle}>
                      {String(specialist.reputation)}
                    </div>
                  </div>
                  <div className={classes.informationRow}>
                    <div className={classes.informationTitle}>
                      Max Destake Allowed
                    </div>
                    <div className={classes.informationTitle}>
                      {" "}
                      {String(maxDestakeAllowed)} $ABK
                    </div>
                  </div>
                </div>
                <Divider />
                <div className={classes.section}>
                  <Row>
                    <Col sm={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                          const tx = await priceFinder.stakeABK(yourAllowance);
                          const isTransactionMined = async (
                            transactionHash
                          ) => {
                            const txReceipt =
                              await connection.provider.getTransactionReceipt(
                                transactionHash
                              );
                            if (txReceipt && txReceipt.blockNumber) {
                              return txReceipt;
                            }
                          };

                          const a = setInterval(() => {
                            if (isTransactionMined(tx.hash)) {
                              setTimeout(() => {
                                mainDataFetching();
                              }, 3 * 1000);
                              clearInterval(a);
                            }
                          }, 2000);
                        }}
                      >
                        Stake
                      </Button>
                    </Col>
                    <Col sm={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          const tx = await priceFinder.destakeABK(
                            maxDestakeAllowed
                          );
                          const isTransactionMined = async (
                            transactionHash
                          ) => {
                            const txReceipt =
                              await connection.provider.getTransactionReceipt(
                                transactionHash
                              );
                            if (txReceipt && txReceipt.blockNumber) {
                              return txReceipt;
                            }
                          };

                          const a = setInterval(() => {
                            if (isTransactionMined(tx.hash)) {
                              setTimeout(() => {
                                mainDataFetching();
                              }, 3 * 1000);
                              clearInterval(a);
                            }
                          }, 2000);
                        }}
                      >
                        De Stake
                      </Button>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </Paper>
        </Col>
        <Col md={8}>
          <Paper square>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Token ID</TableCell>
                  <TableCell>Suggestion Price</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myRequests.map((request) => (
                  <TableRow key={String(request.id)}>
                    <TableCell component="th" scope="row">
                      {String(request.id)}
                    </TableCell>
                    <TableCell>{String(request.tokenId)}</TableCell>
                    <TableCell>
                      <TextField
                        label="Your Suggested Price"
                        size="small"
                        variant="outlined"
                        value={
                          suggestPrice.get(request.id)
                            ? suggestPrice.get(request.id)
                            : ""
                        }
                        onChange={(e) => {
                          const nMa = new Map(suggestPrice);
                          nMa.set(request.id, e.target.value);
                          setSuggestPrice(nMa);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        disabled={!suggestPrice.get(request.id)}
                        onClick={async () => {
                          const tx = await priceFinder.priceAsset(
                            request.id,
                            suggestPrice.get(request.id)
                          );
                          const isTransactionMined = async (
                            transactionHash
                          ) => {
                            const txReceipt =
                              await connection.provider.getTransactionReceipt(
                                transactionHash
                              );
                            if (txReceipt && txReceipt.blockNumber) {
                              return txReceipt;
                            }
                          };

                          const a = setInterval(() => {
                            if (isTransactionMined(tx.hash)) {
                              setTimeout(() => {
                                mainDataFetching();

                                const nMa = new Map(suggestPrice);
                                nMa.set(request.id, "");
                                setSuggestPrice(nMa);
                              }, 3 * 1000);
                              clearInterval(a);
                            }
                          }, 2000);
                        }}
                      >
                        Submit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Col>
      </Row>
    </Container>
  );
};

export default Specialist;
