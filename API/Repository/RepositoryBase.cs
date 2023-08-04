using Contracts;
using Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class RepositoryBase : IRepositoryBase
    {
        private UserContext _userContext;

        public RepositoryBase(UserContext userContext)
        {
            _userContext = userContext;
        }

        public async Task SaveAsync() => await _userContext.SaveChangesAsync();
    }
}
