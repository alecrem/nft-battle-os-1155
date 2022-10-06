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

export function TokenDisplay({ token }) {
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
      <Box w="176px" h="200px">
        {JSON.stringify(tokenMetadata) !== '{}' ? (
          <>
            <Link href={'/single/' + token}>
              <Image src={imageUri} alt={tokenMetadata.name} />
            </Link>
            <Link href={openSeaTokenAddress + token}>
              <Heading as="h3" size="sm" mt="1em">
                {tokenMetadata.name} <ExternalLinkIcon></ExternalLinkIcon>
              </Heading>
            </Link>
            <Text mt="1em">Available properties:</Text>
            {detectedTraits.map((traitname, index) => (
              <Box key={index}>
                {tokenMetadata[traitsPropertyName].filter(
                  (e) => e.trait_type.toLowerCase() == traitname
                ).length > 0 ? (
                  <>
                    <Badge colorScheme="green" mr="4px">
                      {traitname}:{' '}
                      {
                        tokenMetadata[traitsPropertyName].filter(
                          (e) => e.trait_type.toLowerCase() == traitname
                        )[0].value
                      }
                    </Badge>
                  </>
                ) : (
                  <Badge colorScheme="red" mr="4px">
                    <NotAllowedIcon></NotAllowedIcon>
                    {traitname}
                  </Badge>
                )}
              </Box>
            ))}
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
