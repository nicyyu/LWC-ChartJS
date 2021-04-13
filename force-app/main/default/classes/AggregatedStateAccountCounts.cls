public with sharing class AggregatedStateAccountCounts {
    public AggregatedStateAccountCounts() {

    }
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getCounts(){
        try {
            return [
                SELECT 
                    BillingState, 
                    COUNT(Id) 
                FROM Account 
                GROUP BY BillingState
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
