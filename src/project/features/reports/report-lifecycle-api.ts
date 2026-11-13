import {apiRequestJson} from '../auth/auth-http-client'
import type {CompletedReport} from './completed-report'
import type {WorkflowState} from '../exam-workflow/workflow.types'

export interface ReportHistory {
  workflowState:WorkflowState;workflowVersion:number;isLatest:boolean;canRevise:boolean;canRevalidate:boolean;canRequestReview:boolean;canAuthorize:boolean
  versions:Array<{id:string;version:number;physician:{name:string;crm:string};finalizedAt:string;sentAt:string|null;reason:string|null;contentHash:string}>
  reviews:Array<{id:string;reason:string;status:string;requestedAt:string;requestedByName:string;resolutionReason:string|null;resolvedAt:string|null}>
  events:Array<{id:string;action:string;reason:string|null;occurredAt:string;actorName:string;metadata:Record<string,unknown>}>
}
const post=(path:string,body:unknown)=>apiRequestJson(path,{method:'POST',body:JSON.stringify(body)},{authenticated:true})
export const getReportHistory=(id:string)=>apiRequestJson<ReportHistory>(`/report-versions/${id}/history`,{},{authenticated:true})
export const getReportVersion=(id:string)=>apiRequestJson<CompletedReport>(`/report-versions/${id}`,{},{authenticated:true})
export const requestReportReview=(id:string,reason:string)=>post(`/report-versions/${id}/review`,{reason})
export const authorizeReportRevision=(examId:string,completionId:string,physicianUserId:string,reason:string)=>post(`/exams/${examId}/report/authorize`,{completionId,physicianUserId,reason})
export const reviseReport=(examId:string,completionId:string,expectedVersion:number,reason:string)=>post(`/exams/${examId}/report/revise`,{completionId,expectedVersion,reason})
export const revalidateReport=(examId:string,completionId:string,expectedVersion:number,reason:string)=>post(`/exams/${examId}/report/revalidate`,{completionId,expectedVersion,reason})
export const forceReleaseReport=(examId:string,reason:string)=>post(`/exams/${examId}/report/session/force-release`,{reason})
export const recordReportActivity=(id:string,activity:'PRINT_REQUESTED'|'EXPORT_REQUESTED')=>post(`/report-versions/${id}/activity`,{activity})
