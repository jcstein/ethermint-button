import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect, SetStateAction } from 'react'
import { ethers } from 'ethers'
import WavePortal from '../WavePortal.json'
import { useAccount } from "wagmi";
import moment from 'moment'
import { Heading, Flex, VStack, Button, HStack, Text, Link, Card, CardBody, CardHeader, CardFooter, Input } from '@chakra-ui/react';
import { Topbuttons } from "./Components/topbuttons";
import './App.css'

const contractAddress = '0x2c28173956fb0d1ad987586719d0698864dae67c'

function App() {
  useEffect(() => {
    getAllWaves()
    getTotalWaves()
  }, [])
  const [viewState, setViewState] = useState('view-posts')
  const [posts, setPosts] = useState([])
  const [totalWaves, setTotalWaves] = useState(0)
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if(address) {
      getAllWaves()
      getTotalWaves()
    }``
  }, [address])
  const [errorMessage, setErrorMessage] = useState('')
  
  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider((window.ethereum as any))
    const contract = new ethers.Contract(contractAddress, WavePortal.abi, provider)
    let data = await contract.getAllWaves()
    data = data.map((d: { waver: string; timestamp: string }) => ({
      waver: d['waver'],
      timestamp: d['timestamp'],
    }))
    setPosts(data)
  }

  async function getTotalWaves() {
    const provider = new ethers.providers.Web3Provider((window.ethereum as any))
    const contract = new ethers.Contract(contractAddress, WavePortal.abi, provider)
    const totalWaves = await contract.getTotalWaves()
    console.log('total waves', totalWaves)
    setTotalWaves(totalWaves.toString())
  }

  async function wave() {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider((window.ethereum as any))
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, WavePortal.abi, signer)
      const tx = await contract.wave()
      await tx.wait()
      setLoading(false);
      setViewState('view-posts')
    } catch (error) {
      setErrorMessage('You have already mooed today!')
    }
  }

  function toggleView(value: SetStateAction<string>) {
    setViewState(value)
    if (value === 'view-posts') {
      getAllWaves()
      getTotalWaves()
    }
  }

  return (
    <div>
      <Topbuttons />
      <Flex
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
        minHeight="90vh"
      >
      <VStack p="8" maxWidth="800px">
        <Heading size="2xl" mb="5">Say Moo</Heading>
        {!address ? (<div>
        <Heading size="md" pb="3">Getting Started</Heading>
        <Text pb="3">First, DM me at{' '}<Link color="purple.500" href='https://twitter.com/JoshCStein' target="_blank">@JoshCStein</Link>{' '}or{' '}<Link color="purple.500" href='https://www.lensfrens.xyz/joshcs.lens' target="_blank">joshcs.lens</Link>{' '}with your Ethereum wallet address to receive EMT tokens.</Text>
        <Text>Then, you can connect your Ethereum wallet below to the Ethermint Sovereign Rollup to display the posts from the smart contract and post a GM. You only need EMT to post.</Text></div> ) : null}
        {!address ? (<div><br/><Heading size="md" pb="3">Connect your Ethereum wallet to begin ✨</Heading></div> ) : null}
        <ConnectButton />
        {!address ? (<div>
        <br/>
        <Heading size="md" pb="3">Nice, what's going on under the hood?</Heading>
        <Text pb="3">SayMoo.lol is built with{' '}<Link color="purple.500" href='https://celestia.org' target="_blank">Celestia</Link>,{' '}<Link color="purple.500" href='https://rollkit.dev' target="_blank">Rollkit</Link>,{' '}&{' '}<Link color="purple.500" href='https://github.com/celestiaorg/ethermint' target="_blank">Ethermint</Link>.</Text>
        <Text pb="3">This project is a smart contract demo on a{' '}<Link color="purple.500" href='https://celestia.org/glossary/sovereign-rollup' target="_blank">sovereign rollup</Link>{' '}built on Celestia to provide{' '}<Link color="purple.500" href='https://celestia.org/glossary/data-availability' target="_blank">data availability</Link>,{' '}&{' '}<Link color="purple.500" href='https://ethereum.org/en/developers/docs/consensus-mechanisms' target="_blank">consensus</Link>, leveraging Ethermint with Rollkit as the{' '}<Link color="purple.500" href='https://celestia.org/glossary/execution-environment' target="_blank">execution environment</Link>.</Text>
        <Text pb="3">This allows users to securely create and share Moos on the blockchain without the need for a centralized server or authority.</Text>
        <Text>This application is deployed on IPFS and can be accessed through ENS{' '}<Link color="purple.500" href='https://buildmarket.eth.limo' target="_blank">(buildmarket.eth)</Link>{' '}or{' '}<Link color="purple.500" href="https://gmportal.xyz" target="_blank">DNS.</Link>{' '}Read more{' '}<Link color="purple.500" href='https://mirror.xyz/joshcstein.eth/UbInedh4ToAAfsDklzSPb3R1_hVSHIdE97hvxIWYlOo' target="_blank">here 🛸</Link></Text></div> ) : null}
        {address ? (
        <HStack>
          <Button onClick={() => toggleView('view-posts')} colorScheme="purple">Load Moos</Button>
          {errorMessage && <div style={{ padding: '5px' }}>{errorMessage}</div>}
          <Button onClick={wave} colorScheme="green">Say Moo</Button>
          {!errorMessage && loading ? <div style={{padding: '10px'}}>Transaction processing...</div> : null}
        </HStack>
        ) : null}
        {
          viewState === 'view-posts' && address && (
            <div style={{ textAlign: 'left'}}>
              <div>
              <Heading size="lg" pt="5" pb="3" textAlign="center">🐮 Total Moos: {totalWaves}</Heading>
              {
                posts.slice().reverse().map((post, index) => (
                  <Card mb="2">
                  <div key={index}>
                    <CardHeader fontSize="xl" fontWeight="bold">moo</CardHeader>
                    <CardBody py="0" className="address">📤 From: {(post as any).waver}</CardBody>
                    <CardFooter pt="0">⏰ GM'd at: {moment.unix((post as any).timestamp).format('lll')}</CardFooter>
                  </div>
                  </Card>
                ))
              }

            </div>
            </div>
          )
        }
        <br />
        <Text textAlign="center" fontStyle="italic">This site and smart contract are <Link color="purple.500" href='https://github.com/jcstein/gm-portal' target="_blank">open source</Link>{' '}and{' '}the{' '}<Link color="purple.500" href='https://plausible.io/gmportal.xyz' target="_blank">analytics</Link> are GDPR compliant</Text>
      </VStack>
      </Flex>
      </div>
  )
}

export default App