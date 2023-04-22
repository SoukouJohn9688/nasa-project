
const request=require('supertest');
// supertest is the tool that makes requests to our api
const app=require('../../app'); 
const{mongoConnect,
mongoDisconnect
}=require('../../services/mongo')

describe('Launches API',()=>{

    beforeAll(async ()=>{
        await mongoConnect();
    })

    afterAll(async ()=>{
        await mongoDisconnect();
    } )

    describe('TEST GET/launches',()=>{
        test('It should respond with 200 success',async ()=>{
            const response=await request(app)
            .get('/v1/launches')
            .expect('Content-Type',/json/)
            .expect(200);
            //expect(response.statusCode).toBe(200);
        });
    });
    describe('TEST POST/launches',()=>{
    
        const completeLaunchData={
            
                mission:'URSS Entreprise',
                rocket:'NCC 1701-D',
                target:'Kepler-62 f',
                launchDate:'January 4, 2028'     
        }
    
        const launchDataWithoutDate={
            mission:'URSS Entreprise',
            rocket:'NCC 1701-D',
            target:'Kepler-62 f',
    
        }
    
        const launchDataWithInvalidDate={
            
            mission:'URSS Entreprise',
            rocket:'NCC 1701-D',
            target:'Kepler-62 f',
            launchDate:'Februry 28, 2029'     
    }
    
        test('It should respond with 201 create',async ()=>{
            const response=await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type',/json/)
            .expect(201);
    
            const requestDate=new Date(completeLaunchData.launchDate).valueOf();
            const responseDate=new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate);
    
        expect(response.body).toMatchObject(launchDataWithoutDate)
        });
    
        test('It should catch missing required properties',async ()=>{
            const response=await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type',/json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error:"Missing launch properties"
            })
        });
        test('It should catch invalid dates',async ()=>{
            const response=await request(app)
            .post('/v1/launches')
            .send(launchDataWithInvalidDate)
            .expect('Content-Type',/json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error:"Invalid launch dates"
            })
        });
    })
})


