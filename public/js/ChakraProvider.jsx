import React from 'react';
import { ChakraProvider as ChakraProviderRoot, extendTheme } from '@chakra-ui/react';

// Extend the theme to customize colors, fonts, etc.
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f1ff',
      100: '#b8d5ff',
      200: '#8ab9ff',
      300: '#5c9efe',
      400: '#2e83fd',
      500: '#1469e3', // Primary brand color
      600: '#0b52b2',
      700: '#063b81',
      800: '#022551',
      900: '#001122',
    },
  },
  fonts: {
    heading: '"Nunito", sans-serif',
    body: '"Nunito", sans-serif',
  },
});

const ChakraProvider = ({ children }) => {
  return (
    <ChakraProviderRoot theme={theme}>
      {children}
    </ChakraProviderRoot>
  );
};

export default ChakraProvider;
