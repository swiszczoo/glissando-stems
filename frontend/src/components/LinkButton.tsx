import PropTypes from 'prop-types'
import {
    useLocation,
    useNavigate,
    useParams,
  } from "react-router-dom";

import GlissandoButton from './Button';
  
const withRouter=<P extends object>(Component: React.ComponentType<P>) => {
    function ComponentWithRouterProp(props: P) {
        const location = useLocation();
        const navigate = useNavigate();
        const params = useParams();

        return (
        <Component
            {...props}
            router={{ location, navigate, params }}
        />
        );
    }

    return ComponentWithRouterProp;
}

const LinkButton = (props) => {
  const {
    router,
    to,
    onClick,
    // ⬆ filtering out props that `button` doesn’t know what to do with.
    ...rest
  } = props;
  
  return (
    <GlissandoButton
      {...rest} // `children` is just another prop!
      onClick={(event) => {
        onClick && onClick(event);
        router.navigate(to);
      }}
    />
  );
}

LinkButton.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

const LinkButtonWithRouter = withRouter(LinkButton);

export default LinkButtonWithRouter;
