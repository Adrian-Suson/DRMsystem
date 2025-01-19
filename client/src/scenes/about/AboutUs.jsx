import React from "react";
import { Box, Typography, Card, Grid, Avatar } from "@mui/material";
import member1Image from "assets/download.png";
import member2Image from "assets/member2.jpg";
import member3Image from "assets/member3.jpg";
import member4Image from "assets/download.png";

// Team member data with local image paths
const teamMembers = [
  {
    name: "Mika Jae O Acierto",
    phone: "09753187394",
    email: "kimmikaacierto@gmail.com",
    image: member1Image,
  },
  {
    name: "Villacencio, Danie Lyne S.",
    phone: "09060359527",
    email: "dannserisip@gmail.com",
    image: member2Image,
  },
  {
    name: "Nursiya M. Mohammad",
    phone: "09752906092",
    email: "nursiyamusamohammad6@gmail.com",
    image: member3Image,
  },
  {
    name: "Ampong, Timothy Jones G.",
    phone: "09066683027",
    email: "timothyjonesgampong@gmail.com",
    image: member4Image,
  },
];

const AboutUs = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxHeight: "100vh",
      }}
    >
      <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
        Meet Our Team
      </Typography>
      <Typography
        variant="h6"
        paragraph
        sx={{
          maxWidth: "600px",
          color: "#666",
          textAlign: "center",
          mb: 6,
        }}
      >
        A talented team of individuals committed to our vision and excellence.
      </Typography>

      <Grid container spacing={3} sx={{ maxWidth: "900px", width: "100%" }}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
                borderRadius: 2,
                textAlign: "center",
                padding: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <Avatar
                src={member.image}
                alt={member.name}
                sx={{
                  width: 90,
                  height: 90,
                  mb: 2,
                  mx: "auto",
                  boxShadow: 3,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: "600", color: "#333" }}>
                {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Phone:</strong> {member.phone}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <strong>Email:</strong> {member.email}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AboutUs;
