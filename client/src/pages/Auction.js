import { makeStyles, Typography, Button } from "@material-ui/core";
import { Container, Row, Col } from "react-grid-system";
import NFTCard from "../components/NFTCard";

const useStyles = makeStyles((theme) => ({
  root: {},
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
}));

const Auctions = () => {
  const classes = useStyles();

  return (
    <Container>
      <Row>
        <Col md={12}>
          <div className={classes.actions}>
            <Typography variant="h6">On Auction NFTs:</Typography>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <NFTCard
            variant="english"
            src="https://ipfs.io/ipfs/QmYxT4LnK8sqLupjbS6eRvu1si7Ly2wFQAqFebxhWntcf6"
          />
        </Col>
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
      </Row>
    </Container>
  );
};

export default Auctions;
