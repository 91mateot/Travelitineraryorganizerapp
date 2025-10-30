export interface City {
  name: string;
  country: string;
  image: string;
}

// Comprehensive list of world cities
export const worldCities: City[] = [
  // Europe
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
  { name: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
  { name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded' },
  { name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017' },
  { name: 'Berlin', country: 'Germany', image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047' },
  { name: 'Prague', country: 'Czech Republic', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d' },
  { name: 'Vienna', country: 'Austria', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af' },
  { name: 'Venice', country: 'Italy', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9' },
  { name: 'Athens', country: 'Greece', image: 'https://images.unsplash.com/photo-1555993539-1732b0258235' },
  { name: 'Dublin', country: 'Ireland', image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4' },
  { name: 'Edinburgh', country: 'Scotland', image: 'https://images.unsplash.com/photo-1579003593419-98f949b9398f' },
  { name: 'Lisbon', country: 'Portugal', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b' },
  { name: 'Budapest', country: 'Hungary', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d' },
  { name: 'Stockholm', country: 'Sweden', image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11' },
  { name: 'Copenhagen', country: 'Denmark', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc' },
  { name: 'Brussels', country: 'Belgium', image: 'https://images.unsplash.com/photo-1559113202-c916b8e44373' },
  { name: 'Zurich', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
  { name: 'Florence', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
  { name: 'Madrid', country: 'Spain', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4' },
  
  // Asia
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
  { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' },
  { name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd' },
  { name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365' },
  { name: 'Hong Kong', country: 'China', image: 'https://images.unsplash.com/photo-1536599424071-44c59421e0cc' },
  { name: 'Seoul', country: 'South Korea', image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' },
  { name: 'Mumbai', country: 'India', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66' },
  { name: 'Delhi', country: 'India', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5' },
  { name: 'Shanghai', country: 'China', image: 'https://images.unsplash.com/photo-1537667366-5e93c0b45a59' },
  { name: 'Beijing', country: 'China', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d' },
  { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e' },
  { name: 'Phuket', country: 'Thailand', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5' },
  { name: 'Hanoi', country: 'Vietnam', image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8' },
  { name: 'Kuala Lumpur', country: 'Malaysia', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07' },
  { name: 'Osaka', country: 'Japan', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549' },
  { name: 'Istanbul', country: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200' },
  { name: 'Jerusalem', country: 'Israel', image: 'https://images.unsplash.com/photo-1543731068-5c1e38768d46' },
  { name: 'Tel Aviv', country: 'Israel', image: 'https://images.unsplash.com/photo-1537048946032-32bc4da60c7f' },
  
  // Americas
  { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
  { name: 'Los Angeles', country: 'USA', image: 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261' },
  { name: 'San Francisco', country: 'USA', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29' },
  { name: 'Chicago', country: 'USA', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df' },
  { name: 'Miami', country: 'USA', image: 'https://images.unsplash.com/photo-1501509497947-782640bc1412' },
  { name: 'Las Vegas', country: 'USA', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57a' },
  { name: 'Boston', country: 'USA', image: 'https://images.unsplash.com/photo-1554489916-009bee3e9e0a' },
  { name: 'Seattle', country: 'USA', image: 'https://images.unsplash.com/photo-1518698886029-0e20e5cd5d3e' },
  { name: 'Toronto', country: 'Canada', image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225' },
  { name: 'Vancouver', country: 'Canada', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce' },
  { name: 'Mexico City', country: 'Mexico', image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a' },
  { name: 'Cancun', country: 'Mexico', image: 'https://images.unsplash.com/photo-1569074187119-c87815b476da' },
  { name: 'Rio de Janeiro', country: 'Brazil', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325' },
  { name: 'Buenos Aires', country: 'Argentina', image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849' },
  { name: 'Lima', country: 'Peru', image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129' },
  { name: 'Havana', country: 'Cuba', image: 'https://images.unsplash.com/photo-1518104593540-e33716d61c21' },
  
  // Oceania
  { name: 'Sydney', country: 'Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
  { name: 'Melbourne', country: 'Australia', image: 'https://images.unsplash.com/photo-1514395462725-fb4566210144' },
  { name: 'Auckland', country: 'New Zealand', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad' },
  { name: 'Brisbane', country: 'Australia', image: 'https://images.unsplash.com/photo-1565177465524-f17f2cd5e025' },
  { name: 'Perth', country: 'Australia', image: 'https://images.unsplash.com/photo-1591488371788-7070a3087ae5' },
  
  // Africa
  { name: 'Cairo', country: 'Egypt', image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a' },
  { name: 'Cape Town', country: 'South Africa', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99' },
  { name: 'Marrakech', country: 'Morocco', image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371' },
  { name: 'Nairobi', country: 'Kenya', image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6' },
  { name: 'Johannesburg', country: 'South Africa', image: 'https://images.unsplash.com/photo-1563656353898-febc9270a0f5' },
  { name: 'Lagos', country: 'Nigeria', image: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747' },
];

export const getCityDisplay = (city: City): string => {
  return `${city.name}, ${city.country}`;
};

export const searchCities = (query: string): City[] => {
  if (!query) return worldCities;
  
  const lowercaseQuery = query.toLowerCase();
  return worldCities.filter(
    city =>
      city.name.toLowerCase().includes(lowercaseQuery) ||
      city.country.toLowerCase().includes(lowercaseQuery)
  );
};
