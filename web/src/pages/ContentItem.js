/** @jsxImportSource theme-ui */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import sanityClient from "../client.js";
import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { Themed } from "theme-ui";
import moment from "moment";
import Frame from "../components/Frame";

const contentItemSx = {
  ".contentHeader": {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderBottom: "1px solid #000",
    paddingBottom: "0.5em",
    ".dateShareContainer": {
      marginTop: "1.5em",
      display: "flex",
      justifyContent: "space-between",
      h5: { fontStyle: "normal" },
    },
  },
};
const builder = imageUrlBuilder(sanityClient);
function urlFor(source) {
  return builder.image(source);
}

// // `components` object passed to PortableText
const customComponents = {
  block: {
    normal: ({ children }) => <Themed.p>{children}</Themed.p>,
  },
};

export default function ContentItem() {
  const [itemData, setItemData] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    sanityClient
      .fetch(
        `*[slug.current == $slug]{
          title,
          slug,
          mainImage{
            asset->{
              _id,
              url
             }
           },
         body,
         publishedAt,
         issue->{title},
         authors[]->{name, slug},
         sections[]->{title, slug},
       }`,
        { slug }
      )
      .then((data) => setItemData(data[0]))
      .catch(console.error);
  }, [slug]);

  if (!itemData) return <div>Loading...</div>;

  return (
    <div sx={contentItemSx}>
      <Frame
        path={[
          {
            name: "Sections",
          },
          {
            name: itemData.sections[0].title,
            slug: "/sections/" + itemData.sections[0].slug.current,
          },
          { name: itemData.title, slug: "/" + itemData.slug.current },
        ]}
      >
        <div className="contentHeader">
          <div className="topLine">
            <Themed.h5>
              {itemData.sections[0].title} • {itemData.issue.title}
            </Themed.h5>
          </div>
          <div className="title">
            <Themed.h1>{itemData.title}</Themed.h1>
          </div>
          <div className="authors">
            <Themed.h4>
              By{" "}
              {itemData.authors.map((author, i) => (
                <>
                  {i !== 0 && ", "}
                  <Link to={"/authors/" + author.slug.current}>
                    {author.name}
                  </Link>{" "}
                </>
              ))}
            </Themed.h4>
          </div>
          <div className="dateShareContainer">
            <div className="date">
              <Themed.h5>
                {moment(itemData.publishedAt).format("MMMM Do YYYY")}
              </Themed.h5>
            </div>
            <div className="share">
              <Themed.h5>Share</Themed.h5>
            </div>
          </div>
        </div>
        {
          // TODO: figure out multiple image display
          itemData.mainImage && (
            <img src={urlFor(itemData.mainImage).width(200).url()} alt="" />
          )
        }
        <div>
          {itemData.body && (
            <PortableText
              value={itemData.body}
              hardBreak={false}
              components={customComponents}
            />
          )}
        </div>
      </Frame>
    </div>
  );
}