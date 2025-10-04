// Require the JSX implementation and forward props. Using require avoids TSX import typing issues.
const SolarSystemJS: any = require('./SolarSystem.jsx').default || require('./SolarSystem.jsx');

const SolarSystemWrapper = (props: any) => {
  return <SolarSystemJS {...props} />;
};

export default SolarSystemWrapper;
