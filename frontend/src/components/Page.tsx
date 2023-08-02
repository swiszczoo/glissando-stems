import React, { useEffect } from "react";


export interface PageProps extends React.PropsWithChildren {
    name: string;
}

function Page(props: PageProps) {
    useEffect(() => {
        document.title = props.name + ' \u2013 Glissando Stems';
    }, [props.name]);

    return props.children;
}

export default Page;
