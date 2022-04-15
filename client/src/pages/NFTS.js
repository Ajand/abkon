import { makeStyles, Typography, Button } from "@material-ui/core";
import { Container, Row, Col } from "react-grid-system";
import NFTCard from "../components/NFTCard";
import { useEffect, useState } from "react";
import FakeApe from "../web3/abis/FakeApe.json";
import PriceFinder from "../web3/abis/PriceFinder.json";
import { ethers } from "ethers";
import contractsAddress from "../contractsAddress";
import { SpinnerDiamond } from "spinners-react";

// must be able to accept offer

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  loadingContainer: {
    marginTop: theme.spacing(4),
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: "80vh",
  },
}));

const NFTS = ({ connection }) => {
  const classes = useStyles();

  const [myTokens, setMyTokens] = useState([]);
  const [isApprovedForAll, setIsApprovedForAll] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fakeApe = new ethers.Contract(
    contractsAddress.fakeApe,
    FakeApe.abi,
    connection.signer
  );

  const priceFinder = new ethers.Contract(
    contractsAddress.priceFinder,
    PriceFinder.abi,
    connection.signer
  );

  const mainDataFetching = async () => {
    if (connection.account) {
      setMyTokens(await fakeApe.userTokens(connection.account));
      setIsApprovedForAll(
        await fakeApe.isApprovedForAll(
          connection.account,
          contractsAddress.priceFinder
        )
      );
      const requests = await priceFinder.getRequests();

      setMyRequests(
        requests
          .map((req, i) => ({ ...req, id: i }))
          .filter(
            (req) =>
              req.applicant.toLowerCase() ===
                connection.account.toLowerCase() && req.status === 0
          )
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    mainDataFetching();
  }, [connection.account]);

  if (loading)
    return (
      <div className={classes.loadingContainer}>
        <SpinnerDiamond
          size={73}
          thickness={180}
          speed={152}
          color="rgba(77, 119, 255, 1)"
          secondaryColor="rgba(242, 250, 90, 1)"
        />
      </div>
    );

  return (
    <Container>
      <Row>
        <Col md={12}>
          <div className={classes.actions}>
            <Typography variant="h6">Your NFTs:</Typography>
            <div>
              <Button
                disabled={!!isApprovedForAll}
                onClick={async () => {
                  const tx = await fakeApe.setApprovalForAll(
                    contractsAddress.priceFinder,
                    true
                  );
                  const isTransactionMined = async (transactionHash) => {
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
                variant="contained"
                color="primary"
                style={{ marginRight: "1em" }}
              >
                Set Approval For All
              </Button>
              <Button
                disabled={!connection.account}
                onClick={async () => {
                  const tx = await fakeApe.mint();
                  const isTransactionMined = async (transactionHash) => {
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
                variant="contained"
                color="secondary"
              >
                MINT A FAKE APE
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        {myTokens.map((tokenId) => (
          <Col md={3} key={String(tokenId)}>
            <NFTCard
              fakeApe={fakeApe}
              tokenId={tokenId}
              mainDataFetching={mainDataFetching}
              onRequestForPrice={async () => {
                const tx = await priceFinder.requestPrice(
                  fakeApe.address,
                  tokenId
                );
                const isTransactionMined = async (transactionHash) => {
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
            />
          </Col>
        ))}

        {/*  <Col md={3}>
          <NFTCard
            variant="requested"
            src="https://ipfs.io/ipfs/QmcJYkCKK7QPmYWjp4FD2e3Lv5WCGFuHNUByvGKBaytif4"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmYxT4LnK8sqLupjbS6eRvu1si7Ly2wFQAqFebxhWntcf6"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="dutch"
            src="https://ipfs.io/ipfs/QmSg9bPzW9anFYc3wWU5KnvymwkxQTpmqcRSfYj7UmiBa7"
          />
        </Col> */}
      </Row>
      <Row>
        <Col md={12}>
          <div className={classes.actions}>
            <Typography variant="h6">Your Price Requests:</Typography>
          </div>
        </Col>
      </Row>
      <Row>
        {myRequests.map((request) => (
          <Col md={3} key={String(request.tokenId)}>
            <NFTCard
              fakeApe={fakeApe}
              tokenId={request.tokenId}
              mainDataFetching={mainDataFetching}
              request={request}
              variant="requested"
              onDropRequest={async () => {
                const tx = await priceFinder.dropRequest(request.id);
                const isTransactionMined = async (transactionHash) => {
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
              onAcceptRequest={async () => {
                const tx = await priceFinder.acceptOffer(request.id);
                const isTransactionMined = async (transactionHash) => {
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
            />
          </Col>
        ))}

        {/*  <Col md={3}>
          <NFTCard
            variant="requested"
            src="https://ipfs.io/ipfs/QmcJYkCKK7QPmYWjp4FD2e3Lv5WCGFuHNUByvGKBaytif4"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmYxT4LnK8sqLupjbS6eRvu1si7Ly2wFQAqFebxhWntcf6"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="dutch"
            src="https://ipfs.io/ipfs/QmSg9bPzW9anFYc3wWU5KnvymwkxQTpmqcRSfYj7UmiBa7"
          />
        </Col> */}
      </Row>
    </Container>
  );
};

export default NFTS;
