import { makeStyles, Typography, Button } from "@material-ui/core";
import { Container, Row, Col } from "react-grid-system";
import NFTCard from "../components/NFTCard";
import PriceFinder from "../web3/abis/PriceFinder.json";
import ABKoin from "../web3/abis/ABKoin.json";
import AuctionHouse from "../web3/abis/AuctionHouse.json";
import { ethers } from "ethers";
import contractsAddress from "../contractsAddress";
import { SpinnerDiamond } from "spinners-react";
import { useEffect, useState } from "react";

/// Bid English Auction : 10 min

/// Get Dutch Price : 20 min
/// Buy Dutch : 10 min

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

const Auctions = ({ connection }) => {
  const classes = useStyles();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [englishAuctions, setEA] = useState([]);
  const [dutchAuctions, setDA] = useState([]);

  //console.log(englishAuctions);
  // console.log(dutchAuctions);
  //console.log(myRequests);

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

  const auctionHouse = new ethers.Contract(
    contractsAddress.auctionHouse,
    AuctionHouse.abi,
    connection.signer
  );

  const mainDataFetching = async () => {
    const requests = await priceFinder.getRequests();

    setMyRequests(requests.map((req, i) => ({ ...req, id: i })));

    const eAuctions = await auctionHouse.getEnglishAuctions();

    const dAuctions = await auctionHouse.getDutchAuctions();

    setEA(eAuctions);
    setDA(dAuctions);

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
            <Typography variant="h6">English Auctions:</Typography>
          </div>
        </Col>
      </Row>
      <Row>
        {englishAuctions
          .map((eA, id) => ({ ...eA, id }))
          .filter((e) => e.status !== 1)
          .map((ea, i) => (
            <Col key={i} md={3}>
              <NFTCard
                variant="english"
                auction={ea}
                i={i}
                tokenId={
                  myRequests.find(
                    (req) => String(req.id) == String(ea.requestId)
                  ).id
                }
                onEndEngAuction={async () => {
                  const tx = await auctionHouse.endEnglishAuction(ea.id);
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
                bidEngAuction={async () => {
                  const tx = await auctionHouse.bidEnglishAuction(
                    ea.id,
                    ea.status == 2
                      ? parseInt(String(ea.highestBid)) + 1
                      : parseInt(String(ea.startingBid)) + 1
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
                onIncreaseApproval={async () => {
                  const tx = await abKoin.approve(
                    auctionHouse.address,
                    ea.status == 2
                      ? parseInt(String(ea.highestBid)) + 1
                      : parseInt(String(ea.startingBid)) + 1
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
      </Row>
      <Row>
        <Col md={12}>
          <div className={classes.actions}>
            <Typography variant="h6">Dutch Auctions:</Typography>
          </div>
        </Col>
      </Row>
      <Row>
        {dutchAuctions
          .map((eA, id) => ({ ...eA, id }))
          .filter((e) => e.status !== 1)
          .map((ea, i) => (
            <Col key={i} md={3}>
              <NFTCard
                variant="dutch"
                auction={ea}
                i={i}
                tokenId={
                  myRequests.find(
                    (req) => String(req.id) == String(ea.requestId)
                  ).id
                }
                getCurrentPrice={async () => {
                  console.log(ea.id);
                  return await auctionHouse.getDutchPrice(ea.id);
                }}
                buyDutchAuction={async () => {
                  const tx = await auctionHouse.buyDutchAuction(ea.id);
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
                onIncreaseApproval={async () => {
                  const tx = await abKoin.approve(
                    auctionHouse.address,
                    await auctionHouse.getDutchPrice(ea.id)
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
      </Row>
      {/* <Row>
        
        <Col md={3}>
          <NFTCard
            variant="dutch"
            src="https://ipfs.io/ipfs/QmNwbd7ctEhGpVkP8nZvBBQfiNeFKRdxftJAxxEdkUKLcQ"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmWBgfBhyVmHNhBfEQ7p1P4Mpn7pm5b8KgSab2caELnTuV"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmRsJLrg27GQ1ZWyrXZFuJFdU5bapfzsyBfm3CAX1V1bw6"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="dutch"
            src="https://ipfs.io/ipfs/QmSg9bPzW9anFYc3wWU5KnvymwkxQTpmqcRSfYj7UmiBa7"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmXEqPbvM4aq1SQSXN8DSuEcSo5SseYW1izYQbsGB8yn9x"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmUQgKka8EW7exiUHnMwZ4UoXA11wV7NFjHAogVAbasSYy"
          />
        </Col>
        <Col md={3}>
          <NFTCard
            variant="dutch"
            src="https://ipfs.io/ipfs/QmPQdVU1riwzijhCs1Lk6CHmDo4LpmwPPLuDauY3i8gSzL"
          />
        </Col>
  </Row> */}
    </Container>
  );
};

export default Auctions;
