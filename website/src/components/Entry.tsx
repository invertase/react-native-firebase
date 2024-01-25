// import { Providers } from '@/components/Providers'
import { Layout } from '@/components/Layout'

export function Entry({ children }) {
  return <div className="w-full">
       <Layout allSections={{}}>
          {children}
       </Layout>
    </div>
}