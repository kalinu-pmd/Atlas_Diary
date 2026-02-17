import React from "react";
import {
  Box,
  Container,
  Button,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import useStyles from "./styles";
import heroImage from "../../Images/heroSection.png";

/**
 * Hero - simplified, bold, full-bleed background hero.
 * - Large clear sans-serif headline
 * - Strong primary CTA and secondary CTA
 * - Full-bleed background image with a subtle overlay for contrast
 * - Minimal typography/shadowing for a crisp look
 */
export default function Hero() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="section"
      role="banner"
      aria-label="Hero"
      className={classes.hero}
      style={{
        backgroundImage: `linear-gradient(rgba(8,12,10,0.36), rgba(8,12,10,0.06)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay (keeps contrast readable) */}
      <div className={classes.overlay} aria-hidden />

      <Container maxWidth="lg" className={classes.inner}>
        <div className={classes.content}>
          <h1 className={classes.headline}>
            Document Your Adventures.
            <br />
            Relive Every Journey.
          </h1>

          <p className={classes.lead}>
            A travel journal made for explorers — clear, focused and beautiful.
          </p>

          <div
            className={classes.ctaGroup}
            role="group"
            aria-label="Primary actions"
          >
            <Button
              component={RouterLink}
              to="/signup"
              className={classes.primaryBtn}
              size={isMobile ? "medium" : "large"}
              aria-label="Start your journey"
            >
              Start Your Journey
            </Button>

            <Button
              component={RouterLink}
              to="/public-diaries"
              className={classes.secondaryBtn}
              size={isMobile ? "medium" : "large"}
              aria-label="Explore public diaries"
            >
              Explore Public Diaries
            </Button>
          </div>
        </div>
      </Container>
    </Box>
  );
}
