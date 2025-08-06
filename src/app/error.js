
'use client' 

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[420px]">
            <CardHeader className="text-center">
                <CardTitle>Terjadi Kesalahan</CardTitle>
                <CardDescription>
                    Sepertinya ada yang tidak beres.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground overflow-auto max-h-[200px]">
                    <p>{error.message || "Sebuah kesalahan tak terduga terjadi."}</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={() => reset()} className="w-full">Coba Lagi</Button>
            </CardFooter>
        </Card>
    </div>
  )
}
