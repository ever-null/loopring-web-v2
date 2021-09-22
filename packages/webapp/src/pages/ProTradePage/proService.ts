
import * as _ from 'lodash';
import { ammPoolService, tickerService, walletLayer2Service } from 'services/socket';
import { useWalletLayer2 } from 'stores/walletLayer2';
import React from 'react';
import { useWalletLayer1 } from 'stores/walletLayer1';
import { AccountStatus, globalSetup, myLog, SagaStatus } from '@loopring-web/common-resources';
import store from 'stores';
import { merge } from 'rxjs';
import { bookService } from 'services/socket/services/bookService';
import { updatePageTradePro, usePageTradePro } from 'stores/router';
import { useSocket } from 'stores/socket';
import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';
import { SocketMap } from 'stores/socket/interface';
import * as sdk from 'loopring-sdk';
import { LoopringAPI } from 'api_wrapper';
import { swapDependAsync } from '../SwapPage/help';
import { useAmmMap } from 'stores/Amm/AmmMap';
import { makeMarketArray } from 'hooks/help';
import { RawDataTradeItem } from '@loopring-web/component-lib';
import { tradeService } from 'services/socket/services/tradeService';
import { useTicker } from 'stores/ticker';
import { mixorderService } from 'services/socket/services/mixorderService';
const TRADE_ARRAY_MAX_LENGTH  = 50;

/**
 *
 * @param throttleWait
 * @param dependencyCallback
 * @param useInfoUpdateCallback  will update your wallet balance
 * @param walletLayer1Callback
 */
export const useSocketProService = ({
                                        throttleWait = globalSetup.throttleWait,
                                        depDataCallback,
                                        userInfoUpdateCallback,
                                        walletLayer1Callback
                                      }: {
    throttleWait?: number,
    depDataCallback?:()=> void,
    userInfoUpdateCallback?: () => void,
    walletLayer1Callback?: ()=> void,
}) => {
    const {updateWalletLayer1, status: walletLayer1Status,} = useWalletLayer1();
    const {updateWalletLayer2, status: walletLayer2Status,} = useWalletLayer2();
    const subjectWallet = React.useMemo(() => walletLayer2Service.onSocket(), []);
    const subjectBook = React.useMemo(() => bookService.onSocket(), []);
    const {ammMap} = useAmmMap();

    const subjectAmmpool = React.useMemo(() => ammPoolService.onSocket(), []);
    const subjectMixorder = React.useMemo(() => mixorderService.onSocket(), []);
    const subjectTicker = React.useMemo(() => tickerService.onSocket(), []);
    const subjectTrade = React.useMemo(() => tradeService.onSocket(), []);




    const _accountUpdate = _.throttle(({walletLayer1Status, walletLayer2Status}) => {
            if (walletLayer1Status !== SagaStatus.PENDING) {
                updateWalletLayer1()
            }
            if (walletLayer2Status !== SagaStatus.PENDING) {
                updateWalletLayer2()
            }
        }, throttleWait)
    // const _accountUpdate = ({walletLayer2Status, walletLayer1Status}: any) => {
    //     accountUpdate({walletLayer2Status, walletLayer1Status})
    // }

    const _dependencyCallback = _.throttle(() => {
        if(depDataCallback){
            depDataCallback()
        }
    }, throttleWait)
    // const  _socketUpdate = React.useCallback(socketUpdate({updateWalletLayer1,updateWalletLayer2,walletLayer1Status,walletLayer2Status}),[]);
    React.useEffect(() => {
        const subscription = merge(subjectAmmpool,subjectMixorder,subjectTicker,subjectTrade).subscribe((value)=>{
            const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
            // @ts-ignore
            if(ammMap && value && value.ammPoolMap){
                // @ts-ignore
                const ammPoolMap = value.ammPoolMap;
                const market = pageTradePro.market;
                const {address} =  ammMap['AMM-'+market];
                const {pooled:_pooled,lp} = ammPoolMap[address]
                if(_pooled && pageTradePro.ammPoolSnapshot){
                    let pooled = pageTradePro.ammPoolSnapshot.pooled
                    pooled = [{  ...pooled[0],
                            volume: _pooled[0]
                        } ,
                        {...pooled[1],
                            volume: _pooled[1]
                        },
                    ]
                    const ammPoolSnapshot = {
                        ...pageTradePro.ammPoolSnapshot,
                        pooled,
                        lp:{
                            ...pageTradePro.ammPoolSnapshot.lp,
                            volume:lp
                        }
                    }
                    // myLog('socket:ammPoolSnapshot',ammPoolSnapshot)

                    store.dispatch(updatePageTradePro( {market, ammPoolSnapshot: ammPoolSnapshot}))
                }


            }
            // @ts-ignore
            if(value && value.tickerMap){
                const market = pageTradePro.market;
                // @ts-ignore
                const tickerMap = value.tickerMap;
                if(tickerMap.market === market){
                    // myLog('socket:tickMap',tickerMap)
                    store.dispatch(updatePageTradePro( {market,ticker:tickerMap[market]}))
                }
            }
            // @ts-ignore
            if(value && value.mixorderMap){
                const market = pageTradePro.market;
                // @ts-ignore
                const mixorder = value.mixorderMap[market];
                if(mixorder && mixorder.symbol){
                    // myLog('socket:mixorder to depth',mixorder)

                    store.dispatch(updatePageTradePro( {market, depth: mixorder}))
                }
            }
            // @ts-ignore
            if(value && value.trades && value.trade.market === pageTradePro.market ) {
                const market = pageTradePro.market;
                // @ts-ignore
                const _tradeArray = makeMarketArray(market, value.trades);
                let tradeArray = [..._tradeArray,...pageTradePro.tradeArray?pageTradePro.tradeArray:[]];
                tradeArray.length = TRADE_ARRAY_MAX_LENGTH;
                store.dispatch(updatePageTradePro( {market, tradeArray: tradeArray}))

                // tradeArray.splice(-1,)
              // ?.pop()
            }
            //Ticker will update global ticker at tickerService;
            // const walletLayer2Status = store.getState().walletLayer2.status;
            // const walletLayer1Status = store.getState().walletLayer1.status;
            // const tickerStatus  = store.getState().tickerMap.status;
            // _socketUpdate({walletLayer2Status, walletLayer1Status})
        })
        return () => subscription.unsubscribe();
    }, []);



    React.useEffect(() => {
        const subscription = merge(subjectWallet,subjectBook).subscribe(()=>{
            const walletLayer2Status = store.getState().walletLayer2.status;
            const walletLayer1Status = store.getState().walletLayer1.status;
            _accountUpdate({walletLayer2Status, walletLayer1Status})
        })
        return () => subscription.unsubscribe();
    }, []);

    // React.useEffect(() => {
    //     const subscription = merge(subjectWallet,subjectBook).subscribe(()=>{
    //         const walletLayer2Status = store.getState().walletLayer2.status;
    //         const walletLayer1Status = store.getState().walletLayer1.status;
    //         _socketUpdate({walletLayer2Status, walletLayer1Status})
    //     })
    //     return () => subscription.unsubscribe();
    // }, [subjectWallet,subjectBook]);
    React.useEffect(() => {
        if (userInfoUpdateCallback && walletLayer2Status === SagaStatus.UNSET) {
            userInfoUpdateCallback()
        }
    }, [walletLayer2Status])
    React.useEffect(() => {
        if (walletLayer1Callback && walletLayer1Status === SagaStatus.UNSET) {
            walletLayer1Callback()
        }
    }, [walletLayer1Status])
}

export  const useProSocket = () => {
    const {sendSocketTopic, socketEnd} = useSocket();
    const {account, status:accountStatus} = useAccount();
    const {marketArray,marketMap} = useTokenMap();
    const {ammMap} = useAmmMap();
    const {tickerMap} = useTicker()

    const {pageTradePro,updatePageTradePro,__API_REFRESH__} = usePageTradePro();
    const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

    React.useEffect(() => {
        return () => {
            clearTimeout(nodeTimer.current as NodeJS.Timeout);
        }
    }, [nodeTimer.current]);
    const noSocketLoop = React.useCallback(() => {
       if(window.loopringSocket === undefined){
           getDependencyData();
           getMarketDepData();
       }
        //@ts-ignore
        if (nodeTimer.current !== -1) {
            clearTimeout(nodeTimer.current as NodeJS.Timeout);
        }
        nodeTimer.current = setTimeout(noSocketLoop, __API_REFRESH__)
    }, [ nodeTimer])
    const getDependencyData = React.useCallback(async () => {
        const { market} = pageTradePro
        if (market && ammMap && pageTradePro.depthLevel &&  LoopringAPI.exchangeAPI) {
            try {

                const {depth, ammPoolSnapshot} = await swapDependAsync(market, marketMap[market].precisionForPrice - Number(pageTradePro.depthLevel),50);
                // const tickerMap  = makeTickerMap({tickerMap: tickMap})
                const {tickerMap} = store.getState().tickerMap
                // myLog('store.getState().tickerMap',tickerMap[market]);
                updatePageTradePro({market, depth, ammPoolSnapshot, ticker:tickerMap[market]})
            } catch (error) {

            }
        }

    }, [pageTradePro,ammMap,tickerMap]);
    const getMarketDepData = React.useCallback(async () => {
        const { market} = pageTradePro
        if (LoopringAPI.exchangeAPI && market) {
            const {marketTrades} = await LoopringAPI.exchangeAPI.getMarketTrades({market,limit:TRADE_ARRAY_MAX_LENGTH});
            const _tradeArray = makeMarketArray(market, marketTrades)
            const formattedTradArray:RawDataTradeItem[] = _tradeArray.map(o => ({
                ...o,
                precision: marketMap ? marketMap[market].precisionForPrice : undefined
            })) as RawDataTradeItem[]
            // setTradeArray(_tradeArray as RawDataTradeItem[])
            updatePageTradePro({market, tradeArray:formattedTradArray})

        }

    }, [pageTradePro,ammMap])
    React.useEffect(() => {
        getDependencyData();
    },[
        pageTradePro.market,
        pageTradePro.depthLevel
    ])
    React.useEffect(() => {
        getMarketDepData()

    },[
        pageTradePro.market,
    ])

    React.useEffect(() => {
        //firstTime call it
        // getDependencyData();
        noSocketLoop();
        if(ammMap && pageTradePro.market){
            const dataSocket:SocketMap = {
                [ sdk.WsTopicType.ammpool ]:[ ammMap['AMM-'+pageTradePro.market].address],
                [ sdk.WsTopicType.ticker ]:[pageTradePro.market as string],
                [ sdk.WsTopicType.mixorder ]: {markets:[pageTradePro.market],
                    level: marketMap[pageTradePro.market].precisionForPrice - Number(pageTradePro.depthLevel),
                    count: 50,
                    snapshot: true
                },
                [ sdk.WsTopicType.trade ]:[pageTradePro.market as string ],
            }
            if (accountStatus === SagaStatus.UNSET){
                if(account.readyState === AccountStatus.ACTIVATED) {
                    sendSocketTopic({
                        ...dataSocket,
                        [ sdk.WsTopicType.account ]: true,
                        [ sdk.WsTopicType.order]:marketArray,

                    })
                }else{
                    sendSocketTopic(dataSocket)
                }
            }

        }

        return () => {
            socketEnd()
        }
    }, [accountStatus,
        pageTradePro.market,
        pageTradePro.depthLevel]);
}

