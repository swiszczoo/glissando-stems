import {
    useLocation,
    useNavigate,
    useParams,
    Location,
    NavigateFunction,
    Params,

  } from "react-router-dom";

import GlissandoButton from './Button';
  
const withRouter = <P extends LinkButtonProps>(Component: React.ComponentType<P>) => {
    function ComponentWithRouterProp(props: Omit<P, 'router'>) {
        const location = useLocation();
        const navigate = useNavigate();
        const params = useParams();

        const newProps = {
          ...props,
          router: { location, navigate, params },
        } as P;

        return <Component {...newProps} />;
    }

    return ComponentWithRouterProp;
}

interface LinkButtonProps extends React.PropsWithChildren {
  router: { location: Location, navigate: NavigateFunction, params: Readonly<Params<string>> }
  to: string;
}

const LinkButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & LinkButtonProps) => {
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
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick && onClick(event);
        router.navigate(to);
      }}
    />
  );
}

const LinkButtonWithRouter = withRouter(LinkButton);

export default LinkButtonWithRouter;
