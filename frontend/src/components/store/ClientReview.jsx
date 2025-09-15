import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';

const ClientReview = ({ name, review, rating = 5, date }) => {
  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
for (let i = 1; i <= 5; i++) {
  if (i <= fullStars) {
    stars.push(<Star key={i} sx={{ color: '#000000', fontSize: '20px' }} />);
  } else if (i === fullStars + 1 && hasHalfStar) {
    stars.push(<Star key={i} sx={{ color: '#808080', fontSize: '20px' }} />);
  } else {
    stars.push(<StarBorder key={i} sx={{ color: '#FFFFFF', fontSize: '20px' }} />);
  }
}

    
    return stars;
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: '#00000',
        }
      }}
    >
      {/* Star Rating */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        {renderStars(rating)}
      </Box>
      
      {/* Reviewer Name */}
      <Typography 
        variant="h6" 
        component="h3" 
        sx={{ 
          fontWeight: 600, 
          mb: 1,
          color: 'text.primary'
        }}
      >
        {name}
      </Typography>
      
      {/* Review Date */}
      {date && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mb: 2,
            color: 'text.secondary'
          }}
        >
          {date}
        </Typography>
      )}
      
      {/* Review Text */}
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          lineHeight: 1.6,
          flexGrow: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
        }}
      >
        "{review}"
      </Typography>
    </Paper>
  );
};

// Example usage in a component that displays multiple reviews
const ReviewSection = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      review: "The quality of these products exceeded my expectations. The attention to detail is remarkable and the customer service was exceptional. I will definitely be purchasing again!",
      rating: 5,
      date: "January 15, 2025"
    },
    {
      id: 2,
      name: "Michael Chen",
      review: "Absolutely stunning craftsmanship. Each piece feels luxurious and unique. The ordering process was smooth and delivery was faster than expected.",
      rating: 5,
      date: "February 3, 2025"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      review: "I've been searching for high-quality pieces like these for years. Finally found a brand that understands true luxury and elegance. Worth every penny!",
      rating: 4.5,
      date: "March 22, 2025"
    }
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 6 }}>
      <Typography 
        variant="h4" 
        component="h2" 
        align="center" 
        sx={{ 
          mb: 4, 
          fontWeight: 300,
          color: 'text.primary'
        }}
      >
        What Our Clients Say
      </Typography>
      
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}
      >
        {reviews.map((review) => (
          <ClientReview
            key={review.id}
            name={review.name}
            review={review.review}
            rating={review.rating}
            date={review.date}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ReviewSection;