import React from 'react';
import { Box, Button, Typography, Container, useTheme, useMediaQuery } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LuxuryCTA = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
const navigate = useNavigate()
  const handleShopNow = () => {
   navigate('/store/products')
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 10, md: 15 },
        px: { xs: 2, md: 0 },
        overflow: 'hidden',
        background: `
          linear-gradient(135deg, 
            rgba(0, 0, 0, 0.85) 0%, 
            rgba(20, 20, 30, 0.9) 100%),
          url('/Stylish-Octagonal-Sunglasses.png')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(122, 87, 58, 0.3) 0%, rgba(192, 158, 129, 0.2) 100%)',
          zIndex: 1,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: { xs: '100%', md: '70%' },
            mx: 'auto'
          }}
        >
          <Typography
            variant="overline"
            sx={{
              letterSpacing: '4px',
              mb: 2,
              opacity: 0.8,
              fontSize: { xs: '0.7rem', md: '0.8rem' },
              fontWeight: 300
            }}
          >
            ELEVATE YOUR STYLE
          </Typography>
          
          <Typography
            variant={isMobile ? "h6" : "h2"}
            sx={{
              fontWeight: 300,
              mb: 3,
              letterSpacing: { xs: '0.5px', md: '1px' },
              textTransform: 'uppercase'
            }}
          >
            Discover Our Exclusive Collection
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: { xs: '0.8rem', md: '1.1rem' },
              maxWidth: '600px',
              mx: 'auto',
              opacity: 0.9,
              fontWeight: 300,
              lineHeight: 1.6
            }}
          >
            Indulge in our carefully curated selection of premium products, crafted for those who appreciate the finer things in life.
          </Typography>
          
          <Button
            onClick={handleShopNow}
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'rgba(0, 0, 0, 0.9)',
              borderRadius: 0,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 400,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            Shop Now
          </Button>
        </Box>
      </Container>
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '100px',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          zIndex: 2,
          transform: 'rotate(45deg)',
          display: { xs: 'none', lg: 'block' }
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          left: '15%',
          width: '60px',
          height: '60px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          zIndex: 2,
          transform: 'rotate(30deg)',
          display: { xs: 'none', lg: 'block' }
        }}
      />
    </Box>
  );
};

export default LuxuryCTA;