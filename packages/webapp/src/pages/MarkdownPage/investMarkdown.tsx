import { Box, Grid } from "@mui/material";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import React from "react";
import { EmptyDefault } from "@loopring-web/component-lib";
import gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@emotion/react";

import { LoadingBlock } from "../LoadingPage";
import { MarkdownStyle } from "./style";
import { languageMap, myLog } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import {
  Config_INFO_URL,
  EventData,
  url_test_path,
} from "../TradeRacePage/interface";
import moment from "moment";
import { EVENT_STATUS } from "../TradeRacePage/hook";
import { useNotify, useSystem } from "@loopring-web/core";

const url_path = "https://static.loopring.io/documents/notification";
export const InvestMarkdownPage = () => {
  let match: any = useRouteMatch("/invest/:path");
  const { i18n, t } = useTranslation();
  const { search } = useLocation();
  const { notifyMap } = useNotify();
  const searchParams = new URLSearchParams(search);
  const { baseURL } = useSystem();
  // const history = useHistory();

  const [input, setInput] = React.useState<string>("");
  //
  const [path, setPath] = React.useState<null | string>(match?.params.path);
  React.useEffect(() => {
    if (baseURL) {
      try {
        // follow /2021/01/2021-01-01.en.json
        const [year, month] = match?.params.path.split("-");
        const type = searchParams.get("type");
        const index =
          notifyMap?.invest.findIndex((invest) => invest.name === type) ?? -1;
        let filePath = "";
        if (notifyMap?.invest && index >= 0) {
          filePath = notifyMap.invest[index].linkRule;
        } else {
          const path = `${
            /uat/gi.test(baseURL) ? url_test_path : url_path
          }/${year}/${month}/`;
          filePath = `${path}/invest/${type}_rule.en.md`;
        }
        if (year && month && filePath !== "") {
          fetch(filePath)
            .then((response) => response.text())
            .then((input) => {
              setInput(input);
            })
            .catch((e) => {
              setPath(null);
            });
        } else {
          throw "url format wrong";
        }
      } catch (e: any) {
        setPath(null);
      }
    }
  }, [baseURL, i18n.language]);

  const theme = useTheme();

  return (
    <MarkdownStyle
      container
      minHeight={"calc(100% - 260px)"}
      flex={1}
      marginTop={3}
      marginBottom={2}
    >
      <Grid item xs={12}>
        {path ? (
          input ? (
            <Box
              flex={1}
              padding={3}
              boxSizing={"border-box"}
              className={`${theme.mode}  ${theme.mode}-scheme markdown-body MuiPaper-elevation2`}
            >
              <ReactMarkdown remarkPlugins={[gfm]} children={input} />
            </Box>
          ) : (
            <LoadingBlock />
          )
        ) : (
          <EmptyDefault
            height={"100%"}
            message={() => (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {t("labelNoContent")}
              </Box>
            )}
          />
        )}
      </Grid>
    </MarkdownStyle>
  );
};
