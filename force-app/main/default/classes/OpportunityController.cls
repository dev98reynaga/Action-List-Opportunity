public with sharing class OpportunityController {

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getAllOpportunity(String params, String filterField) {
        String query = 'SELECT Id, Name, StageName, CreatedDate, LeadSource FROM Opportunity';
        if(!String.isBlank(params) && !String.isBlank(filterField)){
            String searchString = '\'%' + params + '%\'';
            query = query + ' WHERE ' + filterField + ' LIKE ' + searchString;
        }
        System.debug('query: ' + query);
        return Database.query(query);
    }
}