import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IpfsFile,
  IPFSSourceUpload,
  MintNFTBlock,
  FeeToggle,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { useIPFS, ipfsService } from "services/ipfs";
import {
  EmptyValueTag,
  FeeInfo,
  IPFS_META_URL,
  MintTradeNFT,
  NFTMETA,
  TradeNFT,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { useNFTMint } from "services/mintServices";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";
import { AddResult } from "ipfs-core-types/types/src/root";
import { useNFTMeta } from "services/mintServices/useNFTMeta";
import { NFT_MINT_VALUE, useModalData } from "stores/router";
import * as sdk from "@loopring-web/loopring-sdk";
const MaxSize = 8000000;
const StyleWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const TYPES = ["jpeg", "jpg", "gif", "png"];
export const NFTMintPanel = <
  T extends NFT_MINT_VALUE<I>,
  I,
  C extends FeeInfo
>() => {
  const [ipfsMediaSources, setIpfsMediaSources] =
    React.useState<IpfsFile | null>(null);

  const {
    nftMetaProps,
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    tokenAddress,
    resetMETADAT,
  } = useNFTMeta<Partial<NFTMETA>>();
  const { nftMintProps } = useNFTMint<MintTradeNFT<I>, I, C>({
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    tokenAddress,
  });
  const { nftMintValue } = useModalData();

  // const {
  //   feeInfo,
  //   chargeFeeTokenList,
  //   isFeeNotEnough,
  //   handleFeeChange,
  //   handleOnNFTDataChange,
  //   tradeData,
  // } = nftMintProps;
  const handleFailedUpload = React.useCallback(
    (data: { uniqueId: string; error: sdk.RESULT_INFO }) => {
      setIpfsMediaSources((value) => {
        let _value: IpfsFile = { ...(value ?? {}) } as IpfsFile;
        if (value && value?.uniqueId === data.uniqueId) {
          _value = {
            ..._value,
            ...data,
          };
          nftMetaProps.handleOnMetaChange({
            ...nftMintValue.nftMETA,
            image: undefined,
          });
        }
        return _value;
      });
    },
    [nftMetaProps, nftMintValue.nftMETA]
  );
  const handleSuccessUpload = React.useCallback(
    (data: AddResult & { uniqueId: string }) => {
      setIpfsMediaSources((value) => {
        let _value: IpfsFile = { ...(value ?? {}) } as IpfsFile;
        if (value && value?.uniqueId === data.uniqueId) {
          const cid = data.cid.toString();
          _value = {
            ..._value,
            cid: cid,
            fullSrc: `${LOOPRING_URLs.IPFS_META_URL}${data.path}`,
            // `${LoopringIPFSSiteProtocol}://${LoopringIPFSSite}/ipfs/${cid}`,
            // `${LOOPRING_URLs.IPFS_META_URL}${cid}`,
            isProcessing: false,
          };
          nftMetaProps.handleOnMetaChange({
            ...nftMintValue.nftMETA,
            image: `${IPFS_META_URL}${data.path}`,
          });
        } else if (value) {
          _value = {
            ..._value,
            error: {
              code: UIERROR_CODE.NOT_SAME_IPFS_RESOURCE,
              message: `current View ${value?.file.name} not equal to ipfsLoad ${value.file.name}`,
            },
            isProcessing: false,
          };
          // nftMetaProps.handleOnMetaChange({
          //   ...nftMintValue.nftMETA,
          //   image: null,
          // });
        }
        return _value;
      });
    },
    [nftMetaProps, nftMintValue.nftMETA]
  );
  const { ipfsProvides } = useIPFS({
    handleSuccessUpload,
    handleFailedUpload,
  });
  const { t } = useTranslation();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  // const _handleOnNFTDataChange = (_tradeData: T) => {
  //   if (handleOnNFTDataChange) {
  //     handleOnNFTDataChange({ ...tradeData, ..._tradeData });
  //   }
  // };
  const onFilesLoad = React.useCallback(
    (value: IpfsFile) => {
      ipfsService.addFile({
        ipfs: ipfsProvides.ipfs,
        file: value.file,
        uniqueId: value.uniqueId,
      });
      value.isUpdateIPFS = true;
      setIpfsMediaSources(value);
    },
    [ipfsProvides.ipfs]
  );
  const onDelete = React.useCallback(() => {
    setIpfsMediaSources(null);
    nftMetaProps.handleOnMetaChange({
      ...nftMintValue.nftMETA,
      image: undefined,
    });
    // handleOnNFTDataChange({...tradeValue,tradeValue.me})
  }, [nftMetaProps, nftMintValue.nftMETA]);
  return (
    <StyleWrapper
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      marginBottom={2}
    >
      <Typography
        component={"h3"}
        variant={"h4"}
        paddingX={5 / 2}
        paddingTop={5 / 2}
      >
        {t("labelMINTNFTTitle")}
      </Typography>
      <Grid container spacing={5 / 2} padding={5 / 2}>
        <Grid item xs={12} md={5} position={"relative"}>
          <Typography
            color={"var(--color-text-secondary)"}
            component={"h6"}
            variant={"body2"}
            minWidth={28}
            paddingBottom={1}
          >
            <Trans i18nKey={"labelIPFSUploadTitle"}>
              Upload Image
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"error"}
              >
                *
              </Typography>
            </Trans>
          </Typography>

          <IPFSSourceUpload
            fullSize={true}
            value={ipfsMediaSources}
            maxSize={MaxSize}
            types={TYPES}
            onChange={onFilesLoad}
            onDelete={onDelete}
          />

          <Box marginTop={1}>
            {!chargeFeeTokenList?.length ? (
              <Typography>{t("labelFeeCalculating")}</Typography>
            ) : (
              <>
                <Typography
                  component={"span"}
                  display={"flex"}
                  flexWrap={"wrap"}
                  alignItems={"center"}
                  variant={"body1"}
                  color={"var(--color-text-secondary)"}
                  marginBottom={1}
                >
                  <Typography
                    component={"span"}
                    color={"inherit"}
                    minWidth={28}
                  >
                    {t("labelMINTNFTFee")}：
                  </Typography>
                  <Box
                    component={"span"}
                    display={"flex"}
                    alignItems={"center"}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setDropdownStatus((prev) =>
                        prev === "up" ? "down" : "up"
                      )
                    }
                  >
                    {feeInfo && feeInfo.belong && feeInfo.fee
                      ? feeInfo.fee + " " + feeInfo.belong
                      : EmptyValueTag + " " + feeInfo?.belong}
                    <DropdownIconStyled
                      status={dropdownStatus}
                      fontSize={"medium"}
                    />
                    <Typography
                      marginLeft={1}
                      component={"span"}
                      color={"var(--color-error)"}
                    >
                      {isFeeNotEnough && t("transferLabelFeeNotEnough")}
                    </Typography>
                  </Box>
                </Typography>
                {dropdownStatus === "up" && (
                  <FeeTokenItemWrapper padding={2}>
                    <Typography
                      variant={"body2"}
                      color={"var(--color-text-third)"}
                      marginBottom={1}
                    >
                      {t("transferLabelFeeChoose")}
                    </Typography>
                    <FeeToggle
                      chargeFeeTokenList={chargeFeeTokenList as C[]}
                      handleToggleChange={handleToggleChange}
                      feeInfo={feeInfo as C}
                    />
                  </FeeTokenItemWrapper>
                )}
              </>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <MintNFTBlock
            handleOnMetaChange={nftMetaProps.handleOnMetaChange}
            handleOnNFTDataChange={nftMintProps.handleOnNFTDataChange}
            onMetaClick={nftMetaProps.onMetaClick}
            nftMeta={nftMetaProps.nftMeta}
            mintData={nftMintProps.tradeData}
            feeInfo={nftMintProps.feeInfo}
            handleFeeChange={nftMintProps.handleFeeChange}
          />
        </Grid>
      </Grid>
    </StyleWrapper>
  );
};

// {
//   // image:
//   //   "ipfs:///bafybeidfjqmasnpu6z7gvn7l6wthdcyzxh5uystkky3xvutddbapchbopi/no-time-to-explain.jpeg",
//   // name: "",
//   // royaltyPercentage: 2, // 0 - 10 for UI
//   // nftId: undefined,
//   // nftIdView: undefined,
//   // description: "",
//   // nftBalance: undefined,
//   // collection: undefined,
// }
