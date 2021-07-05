import { task } from 'hardhat/config';
import { eContractid, eEthereumNetwork, eNetwork, ePolygonNetwork } from '../../helpers/types';
import { deployUiPoolDataProvider } from '../../helpers/contracts-deployments';
import { exit } from 'process';
import { usingTenderly } from '../../helpers/tenderly-utils';
import { ZERO_ADDRESS } from '../../helpers/constants';

task(`deploy-${eContractid.UiPoolDataProvider}`, `Deploys the UiPoolDataProvider contract`)
  .addFlag('verify', 'Verify UiPoolDataProvider contract via Etherscan API.')
  .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    if (!localBRE.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }
    const network = localBRE.network.name;

    const addressesByNetwork: {
      [key: string]: { incentivesController: string; aaveOracle: string };
    } = {
      [eEthereumNetwork.kovan]: {
        incentivesController: '0x0000000000000000000000000000000000000000',
        aaveOracle: '0x8fb777d67e9945e2c01936e319057f9d41d559e6',
      },
      [eEthereumNetwork.main]: {
        incentivesController: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
        aaveOracle: '0xa50ba011c48153de246e5192c8f9258a2ba79ca9',
      },
      [ePolygonNetwork.matic]: {
        incentivesController: '0x357D51124f59836DeD84c8a1730D72B749d8BC23',
        aaveOracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
      },
      [ePolygonNetwork.mumbai]: {
        incentivesController: '0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644',
        aaveOracle: '0xC365C653f7229894F93994CD0b30947Ab69Ff1D5',
      },
      [eEthereumNetwork.tenderlyMain]: {
        incentivesController: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
        aaveOracle: '0x3a463fFE9b69364B51113352a17839e36268e657',
      },
    };
    const supportedNetworks = Object.keys(addressesByNetwork);

    if (!supportedNetworks.includes(network)) {
      console.error(
        `[task][error] Network "${network}" not supported, please use one of: ${supportedNetworks.join()}`
      );
      exit(2);
    }

    const oracle = addressesByNetwork[network].aaveOracle;
    const incentivesController = addressesByNetwork[network].incentivesController;

    console.log(`\n- UiPoolDataProvider deployment`);
    console.log('- Params');
    console.log('-  IncentivesController', incentivesController);
    console.log('-  AaveOracle', oracle);
    const uiPoolDataProvider = await deployUiPoolDataProvider(
      [incentivesController, oracle],
      verify
    );

    console.log('UiPoolDataProvider deployed at:', uiPoolDataProvider.address);
    console.log(`\tFinished UiPoolDataProvider deployment`);
    if (usingTenderly()) {
      const postDeployHead = localBRE.tenderlyRPC.getHead();
      const postDeployFork = localBRE.tenderlyRPC.getFork();
      console.log('Tenderly Info');
      console.log('- Head', postDeployHead);
      console.log('- Fork', postDeployFork);
    }
  });
