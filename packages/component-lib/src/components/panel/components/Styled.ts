import styled from '@emotion/styled';
import { Box, IconButton, LinearProgress, linearProgressClasses } from '@material-ui/core';
import { css } from '@emotion/react';


export const BorderLinearProgress = styled(LinearProgress)(({theme}) => ({
    height: 10,
    borderRadius: 5,
    [ `&.${linearProgressClasses.colorPrimary}` ]: {
        backgroundColor: theme.colorBase.textSecondary, //theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [ `& .${linearProgressClasses.bar}` ]: {
        borderRadius: 5,
        backgroundColor: theme.colorBase.primaryLight,
    },
}));
export const IconClearStyled = styled(IconButton)`
  position: absolute;
  top: 30px;
  right: 4px;
` as typeof IconButton

export const IconButtonStyled = styled(IconButton)`
  .MuiToolbar-root &.MuiButtonBase-root {
    svg {
      font-size: ${({theme}) => theme.fontDefault.h4};
      height: 24px;
      width: 24px;
    }

    &.outline {
      background-color: ${({theme}) => theme.colorBase.textDisable};
      margin: 0 ${({theme}) => theme.unit / 2}px;
      ${({theme}) => theme.border.defaultFrame({c_key: 'transparent'})};

      &:last-child {
        margin-right: 0;

      }
    }

  }
` as typeof IconButton

const cssAutoRefresh = (_props: any) => css`
  @keyframes rotate {
    25% {
      transform: rotate(-135deg);
    }
    50% {
      transform: rotate(-135deg);
    }
    75% {
      transform: rotate(-315deg);
    }
    100% {
      transform: rotate(-315deg);
    }
  }

  @keyframes hide1 {
    25% {
      left: -.5em;
      opacity: 0;
    }
    50% {
      left: 0;
      opacity: 1;
    }
  }

  @keyframes hide2 {
    25% {
      right: -.5em;
      opacity: 0;
    }
    50% {
      right: 0;
      opacity: 1;
    }
  }

  @keyframes container {
    //0% { background-image:}
    //5% { background-image: none }
    25% {
      transform: translate3d(0, -50%, 0);
      width: .5em;
    }
    50% {
      transform: translate3d(-100%, -50%, 0);
      width: .5em;
    }
    75% {
      transform: translate3d(-50%, -50%, 0);
      width: 1em;
    }
  }
`
//      //background-image: url("data:image/svg+xml,%3Csvg width='34' height='27' viewBox='0 0 34 27' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M19.354 12.7874H33.4527V12.8709L11.4393 26.1381L22.351 17.5019L19.354 12.7874ZM11.1439 0V26.3259L0 17.5228L11.1439 0Z' fill='%231C60FF'/%3E%3C/svg%3E%0A");
export const CountDownStyled = styled(Box)`
  ${({theme}) => cssAutoRefresh({theme})}
  width: var(--btn-icon-size);
  height: var(--btn-icon-size);
  position: relative;
  background-size: 68%;
  background-repeat: no-repeat;
  background-position: center;

  &.outline {
      // background-color: ${({theme}) => theme.colorBase.textDisable};
    background-color: ${({theme}) => theme.colorBase.backgroundInputOpacity};
    margin: 0 ${({theme}) => theme.unit / 2}px;
    ${({theme}) => theme.border.defaultFrame({c_key: 'transparent'})};
    text-align: center;
    line-height: var(--btn-icon-size);

    &:last-child {
      margin-right: 0;
    }
  }

  &.logo {
    background-image: url("data:image/svg+xml,%3Csvg width='34' height='27' viewBox='0 0 34 27' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M19.354 12.7874H33.4527V12.8709L11.4393 26.1381L22.351 17.5019L19.354 12.7874ZM11.1439 0V26.3259L0 17.5228L11.1439 0Z' fill='%231C60FF'/%3E%3C/svg%3E%0A");
  }

  &.countdown {
    font-size: ${({theme}) => theme.fontDefault.h6};
    display: inline-block;
    color: ${({theme}) => theme.colorBase.primaryLight};

    .circle {
      font-size: ${({theme}) => theme.fontDefault.h3};
      width: 1em;
      height: 1em;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%, -50%, 0);
      animation: container var(--durationInternal) steps(1) infinite;
      overflow: hidden;

      &::before,
      &::after {
        display: block;
        content: '';
        box-sizing: border-box;
        border: .125em solid transparent;
        border-radius: 50%;
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1em;
        transform: rotate(45deg);
        animation-timing-function: linear, steps(1);
        animation-duration: var(--durationInternal), var(--durationInternal);
        animation-iteration-count: infinite, infinite;
      }

      &::before {
        border-color: transparent transparent var(--auto-refresh-color) var(--auto-refresh-color);
        animation-name: rotate, hide1;
        left: 0;
      }

      &::after {
        border-color: var(--auto-refresh-color) var(--auto-refresh-color) transparent transparent;
        animation-delay: var(--delay), var(--delay);
        animation-name: rotate, hide2;
        right: 0;
      }
    }
` as typeof Box
