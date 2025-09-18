export interface ButtonProps {
  id: string;
  item: {
    label: string;
    variant: string;
    size: string;
    href: string;
  };
}

export interface SupportedProjectsProps {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  image: { id: string; description: string };
  date_created: string;
  button?: ButtonProps[];
}

export type SEO = {
  title: string;
  description: string;
  noindex?: boolean;
};

export type Page = {
  title: string;
  seo: SEO;
  blocks: any[];
};
