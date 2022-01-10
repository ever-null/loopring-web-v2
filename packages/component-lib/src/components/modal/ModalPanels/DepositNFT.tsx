import { WithTranslation } from "react-i18next";
import { DepositBase, IconType, PanelProps } from "./BasicPanel";

export const NFTDeposit_Approve_WaitForAuth = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTAccess", { symbol: props.symbol }),
  };
  return <DepositBase {...props} {...propsPatch} />;
};

export const NFTDeposit_Approve_Denied = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelNFTTokenFailedAccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Approve_Submit = (
  props: PanelProps & WithTranslation
) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelNFTTokenSuccessAccess", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_WaitForAuth = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelNFTTokenDepositWaitForAuth", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Denied = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelDepositDenied", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Failed = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelDepositFailed", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};

export const NFTDeposit_Submit = (props: PanelProps & WithTranslation) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelDepositSubmit", {
      symbol: props.symbol,
      value: props.value,
    }),
  };
  return <DepositBase {...propsPatch} {...props} />;
};
