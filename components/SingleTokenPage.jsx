import { useState, useEffect } from 'react'
import { useNetwork } from 'wagmi'
import { Badge, Box, Link, Image, Heading, Text } from '@chakra-ui/react'
import { NotAllowedIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useTokenURI } from '../hooks'
import { detectedTraits } from '../utils/settings'
import {
  getContractAddress,
  openSeaTokenAddress
} from '../utils/contractAddress'

export function SingleTokenPage({ token }) {
  const { chain } = useNetwork()
  const erc1155Contract = getContractAddress({
    name: 'erc1155Contract',
    chainId: chain?.id
  })
  const { processedTokenURI } = useTokenURI(erc1155Contract, token || '0')
  const [tokenMetadata, setTokenMetadata] = useState({})
  const [isIpfs, setIsIpfs] = useState()
  const [traitsPropertyName, setTraitsPropertyName] = useState('traits')
  const [imageUri, setImageUri] = useState('')
  useEffect(() => {
    if (processedTokenURI.length === 0) return

    const tokenUriIsIpfs =
      processedTokenURI.indexOf('https://ipfs.io/ipfs') === 0
    setIsIpfs(tokenUriIsIpfs)
    if (tokenUriIsIpfs) {
      setTraitsPropertyName('properties')
    }

    const fetchTokenMetadata = async () => {
      try {
        const response = await fetch(processedTokenURI)
        if (response.ok !== true) {
          throw 'Error fetching metadata: ' + response.status
        }
        const newData = await response.json()
        setTokenMetadata(newData)
        if (tokenUriIsIpfs)
          setImageUri('https://ipfs.io/ipfs/' + newData.image_url.substring(7))
        else setImageUri(newData.image)
      } catch (error) {
        console.error('error: ', error)
      }
    }
    fetchTokenMetadata()
  }, [processedTokenURI])

  return (
    <>
      <Box mt="1em">
        {JSON.stringify(tokenMetadata) !== '{}' ? (
          <>
            <Image src={imageUri} alt={tokenMetadata.name} />
            {JSON.stringify(tokenMetadata)}
          </>
        ) : (
          <>
            <Box w="176px" h="176px"></Box>
            <Link href={processedTokenURI}>
              <Badge colorScheme="red">Could not fetch: {token}</Badge>
            </Link>
          </>
        )}
      </Box>
    </>
  )
}
