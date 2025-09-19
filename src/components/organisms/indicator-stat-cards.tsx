
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Target, ThumbsUp, ThumbsDown } from "lucide-react"
import { INDICATOR_TEXTS } from "@/lib/constants"

type IndicatorStatCardsProps = {
  total: number
  meetingStandard: number
  notMeetingStandard: number
  category: string
}

export function IndicatorStatCards({
  total,
  meetingStandard,
  notMeetingStandard,
  category,
}: IndicatorStatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {INDICATOR_TEXTS.statCards.totalTitle(category)}
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            {INDICATOR_TEXTS.statCards.totalDescription}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{INDICATOR_TEXTS.statCards.meetingTitle}</CardTitle>
          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{meetingStandard}</div>
          <p className="text-xs text-muted-foreground">{INDICATOR_TEXTS.statCards.meetingDescription}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {INDICATOR_TEXTS.statCards.notMeetingTitle}
          </CardTitle>
          <ThumbsDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notMeetingStandard}</div>
          <p className="text-xs text-muted-foreground">{INDICATOR_TEXTS.statCards.notMeetingDescription}</p>
        </CardContent>
      </Card>
    </div>
  )
}
