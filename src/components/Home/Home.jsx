import React from "react";
// import { Container, Box, useMediaQuery, useTheme } from "@material-ui/core";

import useStyles from "./styles";
import Hero from "../Hero/Hero";
// import Posts from "../Posts/Posts";
import Footer from "../Footer/Footer";

/**
 * Home page composition
 *
 * Layout:
 *  - Navbar (top)
 *  - Hero (marketing / hero section)
 *  - Main content (Posts feed wrapped in a centered container)
 *  - Footer (CTA + links)
 *
 * The component uses responsive spacing so content won't be hidden under a sticky header.
 */
export default function Home() {
  const classes = useStyles?.() || {};
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Top offset to prevent content being hidden by a sticky navbar.
  // If your navbar height differs, adjust this value.
  // const topOffset = isMobile ? 64 : 80;

  return (
    <div className={classes.root || ""}>
      {/* Hero */}
      <Hero />

      {/* Main posts area */}

      {/* <Box
        component="main"
        role="main"
        aria-label="Main content"
        style={{ marginTop: topOffset }}
      >
        <Container maxWidth="lg">
          <Box
            className={classes.postsWrap || ""}
            style={{ paddingTop: 12, paddingBottom: 48 }}
          >



          <Posts />
          </Box>
        </Container>
      </Box>*/}

      {/* Footer */}
      <Footer />
    </div>
  );
}
