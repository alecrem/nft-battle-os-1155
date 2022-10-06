import { useRouter } from 'next/router'
import { Box, Container, Heading } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { Connect } from '../../components'
import { useMounted } from '../../hooks'
import { SingleTokenPage } from '../../components'
import { siteTitle } from '../../utils/settings'

export default function Home() {
  const { query } = useRouter()
  const isMounted = useMounted()
  const { isConnected } = useAccount()

  return (
    <Box>
      <Container maxW="container.sm" mt="4em">
        <Heading as="h1" size="4xl">
          {siteTitle}
        </Heading>
        <Box mt="2em">
          {isMounted && <Connect />}

          {isMounted && isConnected && (
            <>
              <SingleTokenPage token={query.id} />
            </>
          )}
        </Box>
      </Container>
    </Box>
  )
}
